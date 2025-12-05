# Deployment Guide / Deploy Qo'llanma

Bu qo'llanma Inventory Management System loyihasini production muhitga (Render + Vercel) deploy qilish uchun batafsil yo'riqnoma.

## 📋 Prerequisites / Tayyorgarlik

- GitHub account
- Render.com account (backend uchun)
- Vercel account (frontend uchun)
- Git repository (bu loyiha GitHub'ga yuklangan bo'lishi kerak)

---

## 🔧 Backend Deploy (Render.com)

### 1. PostgreSQL Database Yaratish

1. [Render Dashboard](https://dashboard.render.com/) ga kiring
2. "New +" → "PostgreSQL" tanlang
3. Database sozlamalari:
   - **Name:** `inventory-db` (yoki istalgan nom)
   - **Region:** US East (yoki yaqin region)
   - **Plan:** Free (test uchun) yoki Starter
4. "Create Database" tugmasini bosing
5. Database yaratilgandan keyin **Internal Database URL** ni nusxalang (keyin kerak bo'ladi)

### 2. Backend Web Service Yaratish

1. Render Dashboard'da "New +" → "Web Service"
2. GitHub repository'ni connect qiling
3. Sozlamalar:

**Basic Settings:**
- **Name:** `inventory-backend` (yoki istalgan nom)
- **Region:** Database bilan bir xil region
- **Branch:** `main`
- **Root Directory:** `backend`
- **Runtime:** Python 3
- **Build Command:**
  ```bash
  pip install -r requirements.txt
  ```
- **Start Command:**
  ```bash
  uvicorn main:app --host 0.0.0.0 --port $PORT
  ```

**Environment Variables:**
Environment tab'da quyidagi variable'larni qo'shing:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | (1-qadamda nusxalangan PostgreSQL URL) |
| `ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` (frontend URL keyin yangilanadi) |
| `SECRET_KEY` | (Kuchli random string, masalan: `openssl rand -hex 32`) |

**Secret Key generatsiya qilish:**
Terminal'da ishga tushiring:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

4. "Create Web Service" tugmasini bosing
5. Deploy jarayoni tugagach, backend URL'ni nusxalang (masalan: `https://inventory-backend.onrender.com`)

### 3. Backend Test Qilish

Browser'da ochib ko'ring:
- Health check: `https://your-backend.onrender.com/`
- API docs: `https://your-backend.onrender.com/docs`

---

## 🎨 Frontend Deploy (Vercel)

### 1. Vercel'ga Repository Connect Qilish

1. [Vercel Dashboard](https://vercel.com/dashboard) ga kiring
2. "Add New..." → "Project"
3. GitHub repository'ni import qiling
4. Loyihani tanlang

### 2. Build Sozlamalari

**Configure Project:**
- **Framework Preset:** Vite
- **Root Directory:** `frontend`
- **Build Command:** `npm run build` (default)
- **Output Directory:** `dist` (default)

**Environment Variables:**
Environment Variables bo'limida qo'shing:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://your-backend.onrender.com` (2-qadamda olgan backend URL) |

3. "Deploy" tugmasini bosing

### 3. Frontend URL Olish

Deploy tugagach:
- Frontend URL paydo bo'ladi: `https://your-project.vercel.app`
- Bu URLni nusxalang

### 4. Backend CORS Yangilash

Render'da backend'ning Environment Variables'ga qaytib:
- `ALLOWED_ORIGINS` ni yangilang:
  ```
  https://your-project.vercel.app,http://localhost:3000,http://localhost:5173
  ```
- "Save Changes" va backend qayta deploy bo'ladi

---

## ✅ Test va Tekshirish

### 1. Backend API Test

```bash
# Health check
curl https://your-backend.onrender.com/

# Login test
curl -X POST https://your-backend.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "Admin!2025#Secure"}'
```

### 2. Frontend Test

1. Browser'da frontend URL'ni oching: `https://your-project.vercel.app`
2. Login sahifasiga boring
3. Default credentials bilan login qiling:
   - Username: `admin`
   - Password: `Admin!2025#Secure`
4. Dashboard ochilishini tekshiring

---

## 🔐 Xavfsizlik (Production)

### 1. Admin Parolni O'zgartirish

Birinchi login'dan keyin admin parolni o'zgartiring:
- Frontend orqali profile settings
- Yoki database'da to'g'ridan-to'g'ri

### 2. Environment Variables Tekshirish

**Backend (Render):**
- ✅ `DATABASE_URL` — PostgreSQL URL
- ✅ `SECRET_KEY` — Kuchli random string (32+ characters)
- ✅ `ALLOWED_ORIGINS` — Faqat ishonchli frontend URL'lar

**Frontend (Vercel):**
- ✅ `VITE_API_URL` — To'g'ri backend URL

### 3. HTTPS

- ✅ Render va Vercel avtomatik HTTPS ta'minlaydi
- ✅ HTTP so'rovlar avtomatik HTTPS'ga redirect bo'ladi

---

## 🔄 Yangilanishlar Deploy Qilish

### Kod O'zgarishi

1. Local'da kod o'zgartiring va test qiling
2. Git'ga commit qiling:
   ```bash
   git add .
   git commit -m "Feature: yangi funksiya qo'shildi"
   git push origin main
   ```
3. **Render:** Avtomatik detect qilib qayta deploy qiladi
4. **Vercel:** Avtomatik detect qilib qayta deploy qiladi

### Environment Variable O'zgarishi

- Render/Vercel dashboard'dan manual yangilang
- Saqlangandan keyin avtomatik redeploy bo'ladi

---

## 📊 Monitoring va Logs

### Backend Logs (Render)

1. Render Dashboard → Backend service
2. "Logs" tab'ini oching
3. Real-time logs ko'rishingiz mumkin

### Frontend Logs (Vercel)

1. Vercel Dashboard → Project
2. "Deployments" → Latest deployment
3. "View Function Logs"

### Database Monitoring (Render)

1. PostgreSQL database → "Metrics" tab
2. Connections, disk usage, queries ko'rish

---

## 🆘 Troubleshooting / Muammolarni Hal Qilish

### Backend Ishlamayotgan Bo'lsa

1. **Logs tekshiring:**
   - Render dashboard → Logs
   - Database connection error tekshiring

2. **Environment variables:**
   - `DATABASE_URL` to'g'ri formatda ekanini tekshiring
   - PostgreSQL URL `postgresql://` bilan boshlanishi kerak

3. **Database migration:**
   SQLAlchemy avtomatik table yaratadi, lekin agar muammo bo'lsa:
   - Render Shell'da: `python -c "from database import engine; from models import Base; Base.metadata.create_all(bind=engine)"`

### Frontend Backend'ga Ulana Olmasa

1. **CORS error:**
   - Backend `ALLOWED_ORIGINS` da frontend URL borligini tekshiring
   - Browser console'da error xabarni o'qing

2. **API URL noto'g'ri:**
   - Vercel Environment Variables → `VITE_API_URL` to'g'riligini tekshiring
   - Backend URL `/` bilan tugamamasligi kerak

3. **Network tab tekshiring:**
   - Browser DevTools → Network
   - Request URL va response'ni ko'ring

### Database Bo'sh

Backend birinchi ishga tushganda avtomatik `admin` user yaratadi. Agar yaratilmagan bo'lsa:

1. Render Shell oching
2. Python console'da:
   ```python
   from database import SessionLocal
   from models import User
   from auth import get_password_hash
   
   db = SessionLocal()
   admin = User(
       username="admin",
       password=get_password_hash("Admin!2025#Secure"),
       role="admin"
   )
   db.add(admin)
   db.commit()
   ```

---

## 💰 Narxlar (Free Tier)

### Render Free Plan:
- ✅ PostgreSQL: 1 GB storage
- ✅ Web Service: 750 soat/oy (yetarli)
- ⚠️ 15 daqiqa inactivity'dan keyin sleep mode (birinchi request 30s olishi mumkin)

### Vercel Free Plan:
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/oy
- ✅ Automatic HTTPS
- ✅ Custom domain support

### Upgrade Kerak Bo'lsa:
- **Render Starter:** $7/oy (24/7 uptime, no sleep)
- **Vercel Pro:** $20/oy (more bandwidth, analytics)

---

## 🎉 Deploy Tayyor!

Muvaffaqiyatli deploy qilingan URL'lar:
- **Frontend:** `https://your-project.vercel.app`
- **Backend API:** `https://your-backend.onrender.com`
- **API Docs:** `https://your-backend.onrender.com/docs`

Default login:
- Username: `admin`
- Password: `Admin!2025#Secure` ⚠️ (birinchi login'dan keyin o'zgartiring!)

---

## 📞 Support

Muammolar bo'lsa:
1. Logs'ni tekshiring (Render/Vercel dashboard)
2. GitHub Issues yarating
3. [Render Documentation](https://render.com/docs)
4. [Vercel Documentation](https://vercel.com/docs)
