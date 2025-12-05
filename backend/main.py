from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import engine, get_db
from auth import (
    authenticate_user,
    create_access_token,
    get_password_hash,
    get_current_user
)
from datetime import timedelta
import csv
import io

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inventory Management System API")

# CORS configuration
import os

allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize default admin user
@app.on_event("startup")
def startup_event():
    db = next(get_db())
    try:
        # Always ensure admin exists with the expected strong password
        strong_default_password = "Admin!2025#Secure"
        admin = db.query(models.User).filter(models.User.username == "admin").first()
        if not admin:
            admin = models.User(
                username="admin",
                password=get_password_hash(strong_default_password),
                role="admin"
            )
            db.add(admin)
            db.commit()
            print("Default admin user created: admin/Admin!2025#Secure")
        else:
            # Reset admin password to the strong default to guarantee login works
            admin.password = get_password_hash(strong_default_password)
            db.add(admin)
            db.commit()
            print("Default admin user password reset: admin/Admin!2025#Secure")
    finally:
        db.close()

# Health check
@app.get("/")
def read_root():
    return {"message": "Inventory Management System API", "status": "running"}

# Authentication endpoints
@app.post("/auth/login", response_model=schemas.Token)
def login(user_login: schemas.UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_login.username, user_login.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=60 * 24)  # 24 hours
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

# Product endpoints
@app.get("/products", response_model=List[schemas.Product])
def get_products(
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    category: str = None,
    db: Session = Depends(get_db),
    # current_user: models.User = Depends(get_current_user)  # Temporarily disabled
):
    query = db.query(models.Product)
    
    if search:
        query = query.filter(models.Product.name.contains(search))
    
    if category:
        query = query.filter(models.Product.category == category)
    
    products = query.offset(skip).limit(limit).all()
    return products

@app.get("/products/{product_id}", response_model=schemas.Product)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    # current_user: models.User = Depends(get_current_user)  # Temporarily disabled
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.post("/products", response_model=schemas.Product, status_code=status.HTTP_201_CREATED)
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
    # current_user: models.User = Depends(get_current_user)  # Temporarily disabled
):
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.put("/products/{product_id}", response_model=schemas.Product)
def update_product(
    product_id: int,
    product_update: schemas.ProductUpdate,
    db: Session = Depends(get_db),
    # current_user: models.User = Depends(get_current_user)  # Temporarily disabled
):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_product, field, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product

@app.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    # current_user: models.User = Depends(get_current_user)  # Temporarily disabled
):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(db_product)
    db.commit()
    return None

@app.post("/products/{product_id}/stock-in", response_model=schemas.Product)
def stock_in(
    product_id: int,
    operation: schemas.StockOperation,
    db: Session = Depends(get_db),
    # current_user: models.User = Depends(get_current_user)  # Temporarily disabled
):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if operation.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be positive")
    
    db_product.stock += operation.quantity
    db.commit()
    db.refresh(db_product)
    return db_product

@app.post("/products/{product_id}/stock-out", response_model=schemas.Product)
def stock_out(
    product_id: int,
    operation: schemas.StockOperation,
    db: Session = Depends(get_db),
    # current_user: models.User = Depends(get_current_user)  # Temporarily disabled
):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if operation.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be positive")
    
    if db_product.stock < operation.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient stock. Available: {db_product.stock}"
        )
    
    db_product.stock -= operation.quantity
    db.commit()
    db.refresh(db_product)
    return db_product

# Categories endpoint
@app.get("/categories")
def get_categories(
    db: Session = Depends(get_db),
    # current_user: models.User = Depends(get_current_user)  # Temporarily disabled
):
    categories = db.query(models.Product.category).distinct().all()
    return [cat[0] for cat in categories if cat[0]]

# CSV Export
@app.get("/products/export/csv")
def export_products_csv(
    db: Session = Depends(get_db),
    # current_user: models.User = Depends(get_current_user)  # Temporarily disabled
):
    """Export all products to CSV"""
    products = db.query(models.Product).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # CSV header
    writer.writerow(['ID', 'Name', 'Category', 'Price', 'Stock', 'Created At', 'Updated At'])
    
    # Write product data
    for product in products:
        writer.writerow([
            product.id,
            product.name,
            product.category,
            product.price,
            product.stock,
            product.created_at,
            product.updated_at
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=products.csv"}
    )

# CSV Import
@app.post("/products/import/csv")
async def import_products_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    # current_user: models.User = Depends(get_current_user)  # Temporarily disabled
):
    """Import products from CSV"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be CSV format")
    
    contents = await file.read()
    csv_data = io.StringIO(contents.decode('utf-8'))
    csv_reader = csv.DictReader(csv_data)
    
    imported_count = 0
    errors = []
    
    for row_num, row in enumerate(csv_reader, start=2):
        try:
            # Support both lowercase and capitalized headers
            name = row.get('name') or row.get('Name')
            category = row.get('category') or row.get('Category')
            price = row.get('price') or row.get('Price')
            stock = row.get('stock') or row.get('Stock')
            
            if not all([name, category, price, stock]):
                errors.append(f"Row {row_num}: Missing required fields")
                continue
            
            # Create new product from CSV row
            product = models.Product(
                name=name,
                category=category,
                price=float(price),
                stock=int(stock)
            )
            db.add(product)
            imported_count += 1
        except Exception as e:
            errors.append(f"Row {row_num}: {str(e)}")
    
    if imported_count > 0:
        db.commit()
    
    return {
        "imported": imported_count,
        "errors": errors
    }
