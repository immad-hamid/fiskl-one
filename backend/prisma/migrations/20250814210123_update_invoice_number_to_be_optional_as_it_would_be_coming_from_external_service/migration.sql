-- CreateTable
CREATE TABLE "invoices" (
    "id" SERIAL NOT NULL,
    "invoice_number" TEXT,
    "invoice_type" TEXT NOT NULL,
    "invoice_date" DATE NOT NULL,
    "seller_ntn_cnic" TEXT NOT NULL,
    "seller_business_name" TEXT NOT NULL,
    "seller_province" TEXT NOT NULL,
    "seller_address" TEXT NOT NULL,
    "buyer_ntn_cnic" TEXT NOT NULL,
    "buyer_business_name" TEXT NOT NULL,
    "buyer_province" TEXT NOT NULL,
    "buyer_address" TEXT NOT NULL,
    "buyer_registration_type" TEXT NOT NULL,
    "invoice_ref_no" TEXT,
    "scenario_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "total_amount" DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" SERIAL NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "hs_code" TEXT NOT NULL,
    "product_description" TEXT NOT NULL,
    "rate" TEXT NOT NULL,
    "uom" TEXT NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "total_values" DECIMAL(15,2) NOT NULL,
    "value_sales_excluding_st" DECIMAL(15,2) NOT NULL,
    "fixed_notified_value_or_retail_price" DECIMAL(15,2) NOT NULL,
    "sales_tax_applicable" DECIMAL(15,2) NOT NULL,
    "sales_tax_withheld_at_source" DECIMAL(15,2) NOT NULL,
    "extra_tax" TEXT,
    "further_tax" DECIMAL(15,2) NOT NULL,
    "sro_schedule_no" TEXT,
    "fed_payable" DECIMAL(15,2) NOT NULL,
    "discount" DECIMAL(15,2) NOT NULL,
    "sale_type" TEXT,
    "sro_item_serial_no" TEXT,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "api_key" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "company_address" TEXT NOT NULL,
    "company_phone" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE UNIQUE INDEX "users_api_key_key" ON "users"("api_key");

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
