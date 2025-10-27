# 📦 Flylink Tracking - Database Files

This directory contains everything needed for the Supabase database migration.

---

## 📁 FILES

### **`schema.sql`**
Database schema (tables, indexes, triggers).  
Run this in Supabase SQL Editor to create tables.

### **`migrate-sheets-to-supabase.js`**
Migration script to transfer data from Google Sheets to Supabase.  
Run: `node database/migrate-sheets-to-supabase.js`

### **`MIGRATION_GUIDE.md`**
📖 **START HERE** - Complete step-by-step migration guide.

### **`ENV_SETUP.md`**
Environment variables configuration reference.

---

## 🚀 QUICK START

1. **Create Supabase project** at https://supabase.com
2. **Run schema.sql** in Supabase SQL Editor
3. **Configure .env** (see `ENV_SETUP.md`)
4. **Run migration:** `node database/migrate-sheets-to-supabase.js`
5. **Start backend:** `cd backend && npm start`

📖 **Full guide:** See `MIGRATION_GUIDE.md`

---

## 🗄️ DATABASE TABLES

### `orders`
Main table for order information:
- Order ID (FLY25100384811164)
- Tracking Number (JYDIL5000144726YQ)
- Purchase Date
- Cached tracking status

### `tracking_history`
Full event timeline for each order:
- Event timestamp
- Status description
- Location
- Stage

---

## 🔧 BACKEND FILES

The backend has been updated to use Supabase:

- `backend/utils/database.js` - New Supabase client
- `backend/server.js` - Updated to use database instead of Google Sheets
- `backend/package.json` - Added `@supabase/supabase-js`

---

**Need help?** Open `MIGRATION_GUIDE.md` for detailed instructions! 🚀

