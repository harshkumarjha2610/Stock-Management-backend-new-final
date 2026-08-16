# 📡 API Documentation — Multi-Store Stock Management System

**Base URL:** `http://localhost:5000/api`

**Authentication:** All endpoints (except `/auth/login` and `/health`) require:
```
Authorization: Bearer <jwt_token>
```

**Roles:**
| Role | Access |
|---|---|
| `SUPER_ADMIN` | All stores, all endpoints |
| `ADMIN` | Own store only |
| `STAFF` | Limited (configurable) |

---

## 🟢 Health Check

### `GET /api/health`

Check if the server is running.

**Auth Required:** No

**Response:**
```json
{
  "success": true,
  "message": "Stock Management API is running.",
  "timestamp": "2026-04-26T05:35:00.000Z"
}
```

---

## 🔐 Authentication

### `POST /api/auth/login`

Login and receive a JWT token.

**Auth Required:** No

**Request Body:**
```json
{
  "email": "superadmin@stockms.com",
  "password": "SuperAdmin@123"
}
```

**Validation Rules:**
| Field | Type | Rules |
|---|---|---|
| `email` | string | Required, valid email |
| `password` | string | Required, min 6 chars |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "store_id": null,
      "name": "Super Admin",
      "email": "superadmin@stockms.com",
      "role": "SUPER_ADMIN",
      "status": "ACTIVE"
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password."
}
```

---

## 🏪 Stores

> **Access:** `SUPER_ADMIN` only

### `POST /api/stores`

Create a new store.

**Request Body:**
```json
{
  "name": "Mumbai Electronics",
  "owner_name": "Raj Patel",
  "email": "raj@mumbai.com",
  "phone": "9876543210",
  "address": "123 Marine Drive, Mumbai"
}
```

**Validation Rules:**
| Field | Type | Rules |
|---|---|---|
| `name` | string | Required, 2-150 chars |
| `owner_name` | string | Required, 2-150 chars |
| `email` | string | Optional, valid email |
| `phone` | string | Optional, max 20 chars |
| `address` | string | Optional |

**Success Response (201):**
```json
{
  "success": true,
  "message": "Store created successfully.",
  "data": {
    "id": 1,
    "name": "Mumbai Electronics",
    "owner_name": "Raj Patel",
    "email": "raj@mumbai.com",
    "phone": "9876543210",
    "address": "123 Marine Drive, Mumbai",
    "created_at": "2026-04-26T05:35:00.000Z",
    "updated_at": "2026-04-26T05:35:00.000Z"
  }
}
```

---

### `GET /api/stores`

List all stores.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Stores retrieved successfully.",
  "data": [
    { "id": 1, "name": "Mumbai Electronics", "owner_name": "Raj Patel", "..." : "..." },
    { "id": 2, "name": "Delhi Gadgets", "owner_name": "Amit Kumar", "..." : "..." }
  ]
}
```

---

### `GET /api/stores/:id`

Get a single store by ID.

---

## 👤 Users

> **Access:** `SUPER_ADMIN`, `ADMIN`

### `POST /api/users`

Create an Admin or Staff user inside a store.

**Request Body:**
```json
{
  "name": "Store Admin",
  "email": "admin@store1.com",
  "password": "admin123",
  "role": "ADMIN",
  "store_id": 1
}
```

**Validation Rules:**
| Field | Type | Rules |
|---|---|---|
| `name` | string | Required, 2-150 chars |
| `email` | string | Required, valid email |
| `password` | string | Required, 6-128 chars |
| `role` | string | Required, `ADMIN` or `STAFF` |
| `store_id` | integer | Required, must exist |

**Business Rules:**
- Only `SUPER_ADMIN` can create `ADMIN` users
- `ADMIN` can create `STAFF` users within their store
- Email must be unique across the system

**Success Response (201):**
```json
{
  "success": true,
  "message": "User created successfully.",
  "data": {
    "id": 2,
    "store_id": 1,
    "name": "Store Admin",
    "email": "admin@store1.com",
    "role": "ADMIN",
    "status": "ACTIVE"
  }
}
```

---

### `GET /api/users/profile`

Get the currently authenticated user's profile.

**Access:** Any authenticated user

---

### `GET /api/users/store/:storeId`

List all users in a specific store.

---

## 📦 Products

> **Access:** `SUPER_ADMIN`, `ADMIN` (store-scoped)

### `POST /api/products`

Create a product. A barcode is auto-generated.

**Request Body:**
```json
{
  "name": "Samsung Galaxy S24",
  "category": "Mobile Phones",
  "brand": "Samsung",
  "purchase_price": 55000,
  "selling_price": 69999,
  "gst_percent": 18,
  "stock_quantity": 50,
  "min_stock_level": 5,
  "description": "Latest Samsung flagship phone"
}
```

**Validation Rules:**
| Field | Type | Rules |
|---|---|---|
| `name` | string | Required, 1-200 chars |
| `category` | string | Optional, max 100 chars |
| `brand` | string | Optional, max 100 chars |
| `purchase_price` | number | Required, min 0 |
| `selling_price` | number | Required, min 0 |
| `gst_percent` | number | Optional, 0-100, default 0 |
| `stock_quantity` | integer | Optional, min 0, default 0 |
| `min_stock_level` | integer | Optional, min 0, default 5 |
| `description` | string | Optional |

**Success Response (201):**
```json
{
  "success": true,
  "message": "Product created with barcode.",
  "data": {
    "id": 1,
    "store_id": 1,
    "name": "Samsung Galaxy S24",
    "barcode": "STR1-PROD1-4829",
    "barcode_image_url": "/uploads/barcodes/STR1-PROD1-4829.png",
    "stock_quantity": 50,
    "..."  : "..."
  }
}
```

---

### `GET /api/products`

List products with pagination, search, and filtering.

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Items per page (default: 20, max: 100) |
| `search` | string | Search by product name (case-insensitive) |
| `category` | string | Filter by exact category |
| `brand` | string | Filter by exact brand |

**Example:** `GET /api/products?search=samsung&category=Mobile Phones&page=1&limit=10`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Products retrieved successfully.",
  "data": {
    "items": [ { "..." : "..." } ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

---

### `GET /api/products/:id`

Get a single product by ID.

### `PUT /api/products/:id`

Update a product. All fields are optional (at least one required).

### `DELETE /api/products/:id`

Delete a product.

---

## 📊 Stock Management

> **Access:** `SUPER_ADMIN`, `ADMIN` (store-scoped)

### `POST /api/stock/in`

Add stock to a product. Updates quantity and records history.

**Request Body:**
```json
{
  "product_id": 1,
  "quantity": 100,
  "purchase_price": 54000,
  "supplier_name": "Samsung India",
  "reason": "Bulk purchase Q2"
}
```

**Validation Rules:**
| Field | Type | Rules |
|---|---|---|
| `product_id` | integer | Required |
| `quantity` | integer | Required, positive |
| `purchase_price` | number | Optional, min 0 |
| `supplier_name` | string | Optional, max 200 chars |
| `reason` | string | Optional, max 500 chars |

**Success Response (201):**
```json
{
  "success": true,
  "message": "Stock added successfully.",
  "data": {
    "history": { "id": 1, "type": "IN", "quantity": 100, "..." : "..." },
    "new_stock_quantity": 150
  }
}
```

---

### `POST /api/stock/out`

Remove stock from a product. Fails if insufficient stock.

**Request Body:**
```json
{
  "product_id": 1,
  "quantity": 10,
  "reason": "Damaged goods"
}
```

**Error Response (400) — Insufficient stock:**
```json
{
  "success": false,
  "message": "Insufficient stock. Available: 5, Requested: 10"
}
```

---

### `GET /api/stock/history`

Get stock movement history with filters.

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `product_id` | integer | Filter by product |
| `type` | string | `IN` or `OUT` |
| `from` | date | Start date (ISO format) |
| `to` | date | End date (ISO format) |
| `page` | integer | Page number |
| `limit` | integer | Items per page |

---

### `GET /api/stock/low-stock`

Get all products where `stock_quantity ≤ min_stock_level`.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Low stock products retrieved.",
  "data": [
    { "id": 3, "name": "iPhone Case", "stock_quantity": 2, "min_stock_level": 5 }
  ]
}
```

---

## 🧾 Billing

> **Access:** `SUPER_ADMIN`, `ADMIN` (store-scoped)

### `POST /api/billing`

Create a bill. This is a **transactional operation** that:
1. Validates stock availability for all items
2. Calculates GST per product
3. Creates the bill and bill items
4. Reduces stock for each product
5. Updates customer's total purchase amount

**Request Body:**
```json
{
  "customer_id": 1,
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 3, "quantity": 1 }
  ],
  "discount": 500,
  "payment_method": "UPI",
  "paid_status": "PAID"
}
```

**Validation Rules:**
| Field | Type | Rules |
|---|---|---|
| `customer_id` | integer | Optional (walk-in customer) |
| `items` | array | Required, min 1 item |
| `items[].product_id` | integer | Required |
| `items[].quantity` | integer | Required, positive |
| `discount` | number | Optional, min 0, default 0 |
| `payment_method` | string | `CASH`, `UPI`, `CARD`, `BANK_TRANSFER` (default: `CASH`) |
| `paid_status` | string | `PAID`, `UNPAID`, `PARTIAL` (default: `PAID`) |

**GST Calculation (per item):**
```
GST Amount = (selling_price × quantity × gst_percent) / 100
Line Total = (selling_price × quantity) + GST Amount
Final Amount = Sum(Line Totals) - Discount
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Bill created successfully.",
  "data": {
    "id": 1,
    "invoice_number": "INV-1-1714110600000-A3F2",
    "total_amount": 139998,
    "gst_amount": 25199.64,
    "discount": 500,
    "final_amount": 164697.64,
    "payment_method": "UPI",
    "paid_status": "PAID",
    "items": [
      {
        "product_id": 1,
        "quantity": 2,
        "price": 69999,
        "gst_percent": 18,
        "gst_amount": 25199.64,
        "total_amount": 165197.64,
        "product": { "id": 1, "name": "Samsung Galaxy S24", "barcode": "STR1-PROD1-4829" }
      }
    ],
    "customer": { "id": 1, "name": "John Doe", "phone": "9876543210" }
  }
}
```

---

### `GET /api/billing`

List bills with filters and pagination.

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `customer_id` | integer | Filter by customer |
| `payment_method` | string | `CASH`, `UPI`, `CARD`, `BANK_TRANSFER` |
| `paid_status` | string | `PAID`, `UNPAID`, `PARTIAL` |
| `from` | date | Start date |
| `to` | date | End date |
| `page` | integer | Page number |
| `limit` | integer | Items per page |

---

### `GET /api/billing/:id`

Get a bill with all items and customer details.

---

## 📈 Reports

> **Access:** `SUPER_ADMIN`, `ADMIN` (store-scoped)

### `GET /api/reports/dashboard`

Get dashboard summary statistics.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Dashboard stats retrieved.",
  "data": {
    "today_sales": 165197.64,
    "total_products": 25,
    "low_stock_count": 3,
    "total_customers": 42,
    "total_bills": 156
  }
}
```

---

### `GET /api/reports/sales`

Sales aggregation grouped by date.

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `from` | date | Start date (ISO) |
| `to` | date | End date (ISO) |

**Example:** `GET /api/reports/sales?from=2026-04-01&to=2026-04-30`

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "date": "2026-04-26",
      "total_bills": 12,
      "total_sales": 450000,
      "total_gst": 81000,
      "total_discount": 5000,
      "total_final": 526000
    }
  ]
}
```

---

### `GET /api/reports/profit`

Profit breakdown by product.

**Query Parameters:** `from`, `to` (date range)

**Profit Formula:** `(selling_price - purchase_price) × quantity`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_revenue": 450000,
      "total_cost": 330000,
      "total_profit": 120000
    },
    "by_product": [
      {
        "product_id": 1,
        "product_name": "Samsung Galaxy S24",
        "total_quantity": 10,
        "total_revenue": 699990,
        "total_cost": 550000,
        "total_profit": 149990
      }
    ]
  }
}
```

---

### `GET /api/reports/gst`

GST collected grouped by month.

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `month` | string | Format: `YYYY-MM` (e.g., `2026-04`) |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "month": "2026-04",
      "total_sales": 1500000,
      "total_gst": 270000,
      "taxable_amount": 1770000
    }
  ]
}
```

---

## 👥 Customers

> **Access:** `SUPER_ADMIN`, `ADMIN` (store-scoped)

### `POST /api/customers`

Create a customer.

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "9876543210",
  "address": "456 Park Street, Kolkata"
}
```

**Validation Rules:**
| Field | Type | Rules |
|---|---|---|
| `name` | string | Required, 1-150 chars |
| `phone` | string | Optional, max 20 chars |
| `address` | string | Optional |

---

### `GET /api/customers`

List customers with pagination. Params: `page`, `limit`.

### `GET /api/customers/:id`

Get customer details.

### `GET /api/customers/:id/purchases`

Get a customer's purchase history (paginated bills with items).

---

## 👨‍💼 Staff

> **Access:** `SUPER_ADMIN`, `ADMIN` (store-scoped)

### `POST /api/staff`

Create a staff member.

**Request Body:**
```json
{
  "name": "Rohit Sharma",
  "phone": "9988776655",
  "address": "789 MG Road, Bangalore",
  "salary": 25000,
  "joining_date": "2026-04-01"
}
```

**Validation Rules:**
| Field | Type | Rules |
|---|---|---|
| `name` | string | Required, 1-150 chars |
| `phone` | string | Optional, max 20 chars |
| `address` | string | Optional |
| `salary` | number | Required, min 0 |
| `joining_date` | date | Optional, ISO format |

---

### `GET /api/staff`

List all staff members.

### `GET /api/staff/:id`

Get staff member details.

---

### `POST /api/staff/:id/check-in`

Record attendance check-in for today.

**Business Rules:**
- Only one check-in per day
- Cannot check in if already checked in without checking out

**Success Response (201):**
```json
{
  "success": true,
  "message": "Checked in successfully.",
  "data": {
    "id": 1,
    "staff_id": 1,
    "date": "2026-04-26",
    "check_in": "2026-04-26T05:30:00.000Z",
    "check_out": null,
    "working_hours": null
  }
}
```

---

### `POST /api/staff/:id/check-out`

Record attendance check-out. Automatically calculates working hours.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Checked out successfully.",
  "data": {
    "id": 1,
    "staff_id": 1,
    "date": "2026-04-26",
    "check_in": "2026-04-26T05:30:00.000Z",
    "check_out": "2026-04-26T14:30:00.000Z",
    "working_hours": 9.00
  }
}
```

---

### `GET /api/staff/:id/attendance`

Get attendance records for a staff member.

**Query Parameters:** `from`, `to` (date range filter)

---

## 💰 Salary

> **Access:** `SUPER_ADMIN`, `ADMIN` (store-scoped)

### `POST /api/salary`

Record a salary payment.

**Request Body:**
```json
{
  "staff_id": 1,
  "month": "2026-04",
  "amount": 25000,
  "payment_method": "BANK_TRANSFER",
  "paid_date": "2026-04-30",
  "status": "PAID"
}
```

**Validation Rules:**
| Field | Type | Rules |
|---|---|---|
| `staff_id` | integer | Required |
| `month` | string | Required, `YYYY-MM` format |
| `amount` | number | Required, min 0 |
| `payment_method` | string | `CASH`, `UPI`, `CARD`, `BANK_TRANSFER` (default: `CASH`) |
| `paid_date` | date | Optional |
| `status` | string | `PAID` or `PENDING` (default: `PAID`) |

---

### `GET /api/salary/staff/:staffId`

Get salary payment history for a staff member.

---

## ⚠️ Error Response Format

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Descriptive error message.",
  "stack": "Error stack trace (development mode only)"
}
```

**Common HTTP Status Codes:**
| Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request / Validation Error |
| `401` | Unauthorized (missing or invalid token) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Not Found |
| `409` | Conflict (duplicate entry) |
| `500` | Internal Server Error |
