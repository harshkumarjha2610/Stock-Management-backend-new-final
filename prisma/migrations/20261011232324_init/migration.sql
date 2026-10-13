-- CreateEnum
CREATE TYPE "StoreCategory" AS ENUM ('GROCERY', 'GARMENTS');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "CustomerTag" AS ENUM ('new', 'regular', 'vip');

-- CreateEnum
CREATE TYPE "StockStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "StockType" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'UPI', 'CARD', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "PaidStatus" AS ENUM ('PAID', 'UNPAID', 'PARTIAL');

-- CreateEnum
CREATE TYPE "BillType" AS ENUM ('SALE', 'RETURN');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'HALF_DAY');

-- CreateEnum
CREATE TYPE "SalaryPaymentStatus" AS ENUM ('PAID', 'PENDING');

-- CreateTable
CREATE TABLE "stores" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "owner_name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "address" TEXT,
    "category" "StoreCategory" NOT NULL DEFAULT 'GROCERY',
    "logo_url" TEXT,
    "upi_id" VARCHAR(150),
    "upi_payee_name" VARCHAR(150),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STAFF',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_active_store_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "barcode" VARCHAR(100),
    "sku" VARCHAR(100),
    "brand" VARCHAR(100),
    "category" VARCHAR(100),
    "buying_price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "selling_price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "gst_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "stock_quantity" INTEGER NOT NULL DEFAULT 0,
    "min_stock_level" INTEGER NOT NULL DEFAULT 5,
    "status" "StockStatus" NOT NULL DEFAULT 'ACTIVE',
    "barcode_image_url" TEXT,
    "fabric" VARCHAR(100),
    "color" VARCHAR(100),
    "gender" VARCHAR(50),
    "image_url" TEXT,
    "unit" VARCHAR(50),
    "hsn_code" VARCHAR(50),
    "expiry_date" DATE,
    "mfg_date" DATE,
    "invoice_number" VARCHAR(100),
    "purchase_date" DATE,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_sizes" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "size" VARCHAR(20) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "barcode" VARCHAR(100),
    "barcode_image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_sizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_history" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "type" "StockType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "purchase_price" DECIMAL(12,2),
    "reason" VARCHAR(500),
    "supplier_name" VARCHAR(200),
    "note" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(20),
    "email" VARCHAR(100),
    "address" TEXT,
    "city" VARCHAR(100),
    "status" "CustomerStatus" NOT NULL DEFAULT 'active',
    "tag" "CustomerTag" NOT NULL DEFAULT 'new',
    "total_orders" INTEGER NOT NULL DEFAULT 0,
    "total_spent" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "last_purchase" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bills" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "invoice_number" VARCHAR(50) NOT NULL,
    "customer_id" INTEGER,
    "billed_by" INTEGER,
    "customer_name" VARCHAR(150),
    "customer_phone" VARCHAR(20),
    "total_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "gst_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "discount_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "final_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "grand_total" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "cash_received" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "payment_method" "PaymentMethod" NOT NULL DEFAULT 'CASH',
    "paid_status" "PaidStatus" NOT NULL DEFAULT 'PAID',
    "type" "BillType" NOT NULL DEFAULT 'SALE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bill_items" (
    "id" SERIAL NOT NULL,
    "bill_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "size" VARCHAR(20),
    "quantity" INTEGER NOT NULL,
    "purchase_price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "price" DECIMAL(12,2) NOT NULL,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "gst_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "gst_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bill_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(20),
    "address" TEXT,
    "aadhar_card" VARCHAR(20),
    "email_id" VARCHAR(150),
    "photo_url" TEXT,
    "base_salary" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "joining_date" DATE,
    "status" "StockStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance" (
    "id" SERIAL NOT NULL,
    "staff_id" INTEGER NOT NULL,
    "store_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "check_in" TIMESTAMP(3),
    "check_out" TIMESTAMP(3),
    "working_hours" DECIMAL(5,2),
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_payments" (
    "id" SERIAL NOT NULL,
    "staff_id" INTEGER NOT NULL,
    "store_id" INTEGER NOT NULL,
    "month" VARCHAR(7) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "paid_date" DATE,
    "payment_method" "PaymentMethod" NOT NULL DEFAULT 'CASH',
    "status" "SalaryPaymentStatus" NOT NULL DEFAULT 'PAID',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salary_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "products_store_id_idx" ON "products"("store_id");

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE INDEX "products_status_idx" ON "products"("status");

-- CreateIndex
CREATE UNIQUE INDEX "products_store_barcode_unique" ON "products"("store_id", "barcode");

-- CreateIndex
CREATE UNIQUE INDEX "products_store_sku_unique" ON "products"("store_id", "sku");

-- CreateIndex
CREATE INDEX "product_sizes_product_id_idx" ON "product_sizes"("product_id");

-- CreateIndex
CREATE INDEX "product_sizes_barcode_idx" ON "product_sizes"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "product_sizes_product_id_size_key" ON "product_sizes"("product_id", "size");

-- CreateIndex
CREATE INDEX "stock_history_store_id_idx" ON "stock_history"("store_id");

-- CreateIndex
CREATE INDEX "stock_history_product_id_idx" ON "stock_history"("product_id");

-- CreateIndex
CREATE INDEX "stock_history_created_at_idx" ON "stock_history"("created_at");

-- CreateIndex
CREATE INDEX "customers_store_id_idx" ON "customers"("store_id");

-- CreateIndex
CREATE INDEX "customers_phone_idx" ON "customers"("phone");

-- CreateIndex
CREATE INDEX "customers_status_idx" ON "customers"("status");

-- CreateIndex
CREATE INDEX "customers_tag_idx" ON "customers"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "bills_invoice_number_key" ON "bills"("invoice_number");

-- CreateIndex
CREATE INDEX "bills_store_id_idx" ON "bills"("store_id");

-- CreateIndex
CREATE INDEX "bills_customer_id_idx" ON "bills"("customer_id");

-- CreateIndex
CREATE INDEX "bills_billed_by_idx" ON "bills"("billed_by");

-- CreateIndex
CREATE INDEX "bills_created_at_idx" ON "bills"("created_at");

-- CreateIndex
CREATE INDEX "bill_items_bill_id_idx" ON "bill_items"("bill_id");

-- CreateIndex
CREATE INDEX "bill_items_product_id_idx" ON "bill_items"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_user_id_key" ON "staff"("user_id");

-- CreateIndex
CREATE INDEX "staff_store_id_idx" ON "staff"("store_id");

-- CreateIndex
CREATE INDEX "attendance_staff_id_idx" ON "attendance"("staff_id");

-- CreateIndex
CREATE INDEX "attendance_store_id_idx" ON "attendance"("store_id");

-- CreateIndex
CREATE INDEX "attendance_date_idx" ON "attendance"("date");

-- CreateIndex
CREATE INDEX "salary_payments_staff_id_idx" ON "salary_payments"("staff_id");

-- CreateIndex
CREATE INDEX "salary_payments_store_id_idx" ON "salary_payments"("store_id");

-- CreateIndex
CREATE INDEX "salary_payments_month_idx" ON "salary_payments"("month");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_last_active_store_id_fkey" FOREIGN KEY ("last_active_store_id") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_sizes" ADD CONSTRAINT "product_sizes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_history" ADD CONSTRAINT "stock_history_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_history" ADD CONSTRAINT "stock_history_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_billed_by_fkey" FOREIGN KEY ("billed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_items" ADD CONSTRAINT "bill_items_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_items" ADD CONSTRAINT "bill_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_payments" ADD CONSTRAINT "salary_payments_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_payments" ADD CONSTRAINT "salary_payments_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
