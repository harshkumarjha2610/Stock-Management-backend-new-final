# 🚀 Setup & Running Guide

## Prerequisites

| Requirement | Version |
|---|---|
| **Node.js** | v18 or higher |
| **PostgreSQL** | v14 or higher |
| **npm** | v9 or higher |

---

## 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd stock-management

# Install all dependencies
npm install
```

---

## 2. Environment Configuration

Copy the example env file and update it with your credentials:

```bash
# Windows
copy .env.example .env

# Linux / macOS
cp .env.example .env
```

Open `.env` and configure:

```env
# Server
PORT=5000
NODE_ENV=development

# PostgreSQL — update these with your credentials
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stock_management
DB_USER=postgres
DB_PASSWORD=your_actual_password

# JWT — change the secret in production
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRES_IN=7d

# Super Admin seed credentials
SUPER_ADMIN_EMAIL=superadmin@stockms.com
SUPER_ADMIN_PASSWORD=SuperAdmin@123
SUPER_ADMIN_NAME=Super Admin
```

---

## 3. Create the Database

Open your PostgreSQL client (psql, pgAdmin, etc.) and create the database:

```sql
CREATE DATABASE stock_management;
```

Or via the command line:

```bash
psql -U postgres -c "CREATE DATABASE stock_management;"
```

> **Note:** The application will automatically create all tables on first startup using `sequelize.sync({ alter: true })`. No manual migration is needed.

---

## 4. Start the Server

### Development (with auto-reload)

```bash
npm run dev
```

### Production

```bash
npm start
```

### Expected Output

```
✅ Database connection established successfully.
✅ Database models synchronized.
✅ Super Admin seeded: superadmin@stockms.com
🚀 Server running on port 5000 in development mode
📋 Health check: http://localhost:5000/api/health
```

---

## 5. Verify It's Running

```bash
curl http://localhost:5000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "Stock Management API is running.",
  "timestamp": "2026-04-26T05:35:00.000Z"
}
```

---

## 6. First Login

Use the seeded Super Admin credentials:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "superadmin@stockms.com", "password": "SuperAdmin@123"}'
```

Copy the `token` from the response — you'll use it as `Authorization: Bearer <token>` for all other API calls.

---

## 7. Typical First-Time Workflow

1. **Login** → Get JWT token
2. **Create a Store** → `POST /api/stores`
3. **Create an Admin** for that store → `POST /api/users`
4. **Login as Admin** → Get Admin's JWT token
5. **Add Products** → `POST /api/products`
6. **Add Customers** → `POST /api/customers`
7. **Create Bills** → `POST /api/billing`
8. **View Reports** → `GET /api/reports/dashboard`

---

## Project Scripts

| Script | Command | Description |
|---|---|---|
| **Dev** | `npm run dev` | Start with nodemon (auto-reload) |
| **Start** | `npm start` | Production start |
| **Seed** | `npm run seed` | Re-run super admin seeder |

---

## Folder Structure

```
stock-management/
├── package.json
├── .env.example
├── .env                    ← Your local config (git-ignored)
├── .gitignore
├── SETUP.md                ← This file
├── API_DOCS.md             ← Full API reference
└── src/
    ├── app.js              → Express app + middleware
    ├── server.js           → Entry point
    ├── config/             → DB & env config
    ├── constants/          → Role, stock type, payment enums
    ├── controllers/        → Thin request handlers
    ├── middlewares/        → Auth, error, validation
    ├── models/             → Sequelize models + associations
    ├── routes/             → RESTful route definitions
    ├── seeders/            → Super admin seed
    ├── services/           → Business logic layer
    ├── utils/              → Helpers (error, pagination, response)
    └── validations/        → Joi schemas
```

---

## Troubleshooting

| Issue | Solution |
|---|---|
| `ECONNREFUSED` on startup | Ensure PostgreSQL is running and credentials in `.env` are correct |
| `relation does not exist` | The app auto-creates tables. Restart the server to trigger sync |
| `Execution policy` error (Windows) | Run: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` |
| Port already in use | Change `PORT` in `.env` or kill the process on that port |
| `Invalid or expired token` | Login again to get a fresh JWT token |
