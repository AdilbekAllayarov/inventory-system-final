# Inventory Management System

Full-stack inventory management application with React frontend and FastAPI backend.

## Features

✅ Product CRUD operations (Create, Read, Update, Delete)  
✅ Stock In/Out management  
✅ Real-time stock calculations  
✅ Search and filter functionality  
✅ Category-based filtering  
✅ JWT Authentication  
✅ Multi-language support (English, Japanese, Uzbek)  
✅ Responsive UI with Bootstrap  
✅ RESTful API  

## Tech Stack

### Frontend
- React 18
- React Router v6
- React Bootstrap
- Axios
- i18next (internationalization)
- Vite

### Backend
- Python FastAPI
- SQLAlchemy ORM
- SQLite (development) / PostgreSQL (production)
- JWT authentication
- Pydantic schemas
- psycopg2-binary (PostgreSQL driver)

## Project Structure

```
inventory-management/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── database.py          # Database configuration
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── auth.py              # Authentication logic
│   ├── requirements.txt     # Python dependencies
│   └── inventory.db         # SQLite database (auto-created)
│
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   ├── pages/           # Page components
    │   ├── services/        # API service
    │   ├── i18n/            # Translation files
    │   ├── App.jsx          # Main app component
    │   └── main.jsx         # Entry point
    ├── package.json
    └── vite.config.js
```

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On macOS/Linux
# or
venv\Scripts\activate  # On Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the backend server:
```bash
uvicorn main:app --reload
```

Backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## Default Login Credentials

- Username: `admin`
- Password: `Admin!2025#Secure`

⚠️ **Important:** Change the password after first login in production!

## API Endpoints

### Authentication
- `POST /auth/login` - User login

### Products
- `GET /products` - Get all products
- `GET /products/{id}` - Get single product
- `POST /products` - Create new product
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Delete product
- `POST /products/{id}/stock-in` - Add stock
- `POST /products/{id}/stock-out` - Remove stock

### Categories
- `GET /categories` - Get all categories

## Language Support

The application supports three languages:
- English (EN)
- Japanese (日本語)
- Uzbek (UZ)

Language can be switched using the language selector in the navigation bar.

## Deployment

📚 **For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)**

### Quick Deploy Summary

**Backend (Render.com):**
1. Create PostgreSQL database on Render
2. Create Web Service with these settings:
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Environment Variables:
     - `DATABASE_URL` (PostgreSQL URL from Render)
     - `ALLOWED_ORIGINS` (your Vercel frontend URL)
     - `SECRET_KEY` (generate with: `python3 -c "import secrets; print(secrets.token_hex(32))"`)

**Frontend (Vercel):**
1. Connect GitHub repository to Vercel
2. Set root directory to `frontend`
3. Add environment variable:
   - `VITE_API_URL` (your Render backend URL)
4. Deploy

**Full step-by-step guide:** [DEPLOYMENT.md](DEPLOYMENT.md)

## Development Notes

- Database is automatically created on first run
- Admin user is auto-created on startup
- All API routes require authentication (except login)
- Frontend uses localStorage for JWT token storage
- Stock operations are validated server-side

## Building for Production

### Frontend
```bash
cd frontend
npm run build
```

### Backend
The backend runs as-is with uvicorn. For production, consider using:
- Gunicorn with uvicorn workers
- Docker containerization
- PostgreSQL instead of SQLite

## License

MIT License - Free to use for personal and commercial projects.

## Support

For issues or questions, please create an issue in the repository.
