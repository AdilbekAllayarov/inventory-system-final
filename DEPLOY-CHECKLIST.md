# Deploy Qilish Oldi Tekshiruv / Pre-Deployment Checklist

Bu ro'yxatni deploy qilishdan oldin to'liq tekshiring.

## ✅ Backend Tayyorgarlik

- [x] **PostgreSQL support qo'shildi** (`backend/database.py`)
  - Environment variable orqali SQLite/PostgreSQL tanlov
  - Render PostgreSQL URL formati fix (postgres:// → postgresql://)

- [x] **Dependencies yangilandi** (`backend/requirements.txt`)
  - `psycopg2-binary==2.9.9` qo'shildi

- [x] **CORS sozlamalari** (`backend/main.py`)
  - `ALLOWED_ORIGINS` environment variable orqali sozlanadi
  - Production frontend URL qo'shish mumkin

- [x] **Environment variables namunasi** (`backend/.env.example`)
  - `DATABASE_URL` — PostgreSQL URL (Render beradi)
  - `ALLOWED_ORIGINS` — Frontend URL
  - `SECRET_KEY` — JWT uchun

- [ ] **Secret key generate qiling:**
  ```bash
  python3 -c "import secrets; print(secrets.token_hex(32))"
  ```

## ✅ Frontend Tayyorgarlik

- [x] **API URL environment variable** (`frontend/src/services/api.js`)
  - Allaqachon `VITE_API_URL` ishlatadi

- [x] **Environment variables namunasi** (`frontend/.env.example`)
  - Local: `http://localhost:8000`
  - Production: Render backend URL

- [ ] **Production `.env` fayli yarating:**
  ```bash
  cd frontend
  cp .env.example .env
  # Edit .env va VITE_API_URL ni to'g'ri backend URL ga o'zgartiring
  ```

## ✅ Git Repository

- [ ] **GitHub repository yarating:**
  ```bash
  git init
  git add .
  git commit -m "Initial commit: Inventory Management System"
  git branch -M main
  git remote add origin https://github.com/your-username/inventory-system.git
  git push -u origin main
  ```

- [x] **`.gitignore` fayllar to'g'ri:**
  - `backend/.gitignore` — `.env`, `*.db`, `venv/`
  - `frontend/.gitignore` — `.env.local`, `dist/`, `node_modules/`

## ✅ Render.com (Backend)

### 1. PostgreSQL Database

- [ ] Render Dashboard → New → PostgreSQL
- [ ] Database nomi: `inventory-db`
- [ ] Plan: Free (test) yoki Starter (prod)
- [ ] **Internal Database URL ni nusxalang**

### 2. Web Service

- [ ] Render Dashboard → New → Web Service
- [ ] GitHub repository connect
- [ ] Sozlamalar:
  - Name: `inventory-backend`
  - Root Directory: `backend`
  - Build: `pip install -r requirements.txt`
  - Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
  
### 3. Environment Variables

Render Web Service → Environment:

| Variable | Qiymat | Misol |
|----------|--------|-------|
| `DATABASE_URL` | PostgreSQL URL | `postgresql://user:pass@host:5432/db` |
| `ALLOWED_ORIGINS` | Frontend URL | `https://your-app.vercel.app` |
| `SECRET_KEY` | Random string | (python3 -c "..." output) |

- [ ] Environment variables qo'shildi
- [ ] Deploy boshlandi
- [ ] **Backend URL ni nusxalang:** `https://your-backend.onrender.com`

## ✅ Vercel (Frontend)

### 1. Import Project

- [ ] Vercel Dashboard → Add New → Project
- [ ] GitHub repository import
- [ ] Framework: Vite
- [ ] Root Directory: `frontend`

### 2. Environment Variables

- [ ] `VITE_API_URL` = `https://your-backend.onrender.com` (Render URL)

### 3. Deploy

- [ ] Deploy tugmasi bosildi
- [ ] Build muvaffaqiyatli tugadi
- [ ] **Frontend URL ni nusxalang:** `https://your-app.vercel.app`

### 4. Backend CORS Yangilash

- [ ] Render → Backend → Environment → `ALLOWED_ORIGINS`
- [ ] Vercel frontend URL qo'shildi
- [ ] Backend qayta deploy bo'ldi

## ✅ Final Testing

### Backend Test

- [ ] Health check: `https://your-backend.onrender.com/`
  ```bash
  curl https://your-backend.onrender.com/
  ```
  Expected: `{"message": "Inventory Management System API", "status": "running"}`

- [ ] API Docs: `https://your-backend.onrender.com/docs`
  - Swagger UI ochiladi

- [ ] Login test:
  ```bash
  curl -X POST https://your-backend.onrender.com/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username": "admin", "password": "Admin!2025#Secure"}'
  ```
  Expected: `{"access_token": "...", "token_type": "bearer", "user": {...}}`

### Frontend Test

- [ ] Browser'da: `https://your-app.vercel.app`
- [ ] Login sahifasi ochiladi
- [ ] Admin credentials bilan login:
  - Username: `admin`
  - Password: `Admin!2025#Secure`
- [ ] Dashboard ochiladi
- [ ] Products sahifasida mahsulotlar ko'rinadi
- [ ] Yangi mahsulot qo'shish ishlaydi
- [ ] Stock In/Out ishlaydi
- [ ] Til o'zgartirish ishlaydi (EN/JA/UZ)

### Cross-Origin Test

- [ ] Browser Console'da CORS error yo'q
- [ ] Network tab'da API requestlar muvaffaqiyatli (200/201)
- [ ] Authentication token to'g'ri yuboriladi

## 🔐 Xavfsizlik

- [ ] Admin parolni production'da o'zgartirdingiz
- [ ] `SECRET_KEY` kuchli random string (32+ chars)
- [ ] `ALLOWED_ORIGINS` faqat ishonchli domain'lar
- [ ] `.env` fayllar `.gitignore` da

## 📊 Monitoring

- [ ] Render Logs tekshirdingiz
- [ ] Vercel Deployment logs tekshirdingiz
- [ ] Database connection ishlayapti
- [ ] No critical errors

## 🎉 Deploy Muvaffaqiyatli!

**Live URLs:**
- Frontend: `https://__________________.vercel.app`
- Backend: `https://__________________.onrender.com`
- API Docs: `https://__________________.onrender.com/docs`

**Default Login:**
- Username: `admin`
- Password: `Admin!2025#Secure`

⚠️ **Birinchi login'dan keyin admin parolni o'zgartiring!**

---

**Qo'shimcha yordam:** [DEPLOYMENT.md](DEPLOYMENT.md) — Batafsil deploy qo'llanma
