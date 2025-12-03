from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
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

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inventory Management System API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific origins in production
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
    current_user: models.User = Depends(get_current_user)
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
    current_user: models.User = Depends(get_current_user)
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.post("/products", response_model=schemas.Product, status_code=status.HTTP_201_CREATED)
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.put("/products/{product_id}", response_model=schemas.Product)
def update_product(
    product_id: int,
    product_update: schemas.ProductUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_product, field, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product

@app.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
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
    current_user: models.User = Depends(get_current_user)
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
    current_user: models.User = Depends(get_current_user)
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
    current_user: models.User = Depends(get_current_user)
):
    categories = db.query(models.Product.category).distinct().all()
    return [cat[0] for cat in categories if cat[0]]
