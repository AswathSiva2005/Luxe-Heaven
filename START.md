# How to Start Luxe Heaven Project

## Prerequisites
1. Make sure you have Node.js installed
2. Install dependencies for both backend and frontend

## Installation Steps

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

## Starting the Application

### Option 1: Using Separate Terminal Windows (Recommended)

**Terminal 1 - Backend:**
```bash
cd "Luxe Heaven/backend"
npm run dev
```
Backend will run on: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd "Luxe Heaven/frontend"
npm run dev
```
Frontend will run on: http://localhost:3000

### Option 2: Using PowerShell (Run both in background)

**Backend:**
```powershell
cd "Luxe Heaven/backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
```

**Frontend:**
```powershell
cd "Luxe Heaven/frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
```

## Quick Start Commands

**Backend (with nodemon - auto-restart on changes):**
```bash
cd backend
npm run dev
```

**Frontend (React development server):**
```bash
cd frontend
npm run dev
```

## Notes
- Backend runs on port 5000
- Frontend runs on port 3000
- Make sure your MongoDB Atlas connection string is set in `backend/.env`
- The frontend will automatically open in your browser at http://localhost:3000

