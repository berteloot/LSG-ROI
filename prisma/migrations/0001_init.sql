-- CreateTable
CREATE TABLE "EmployerCostData" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "ratePercent" DOUBLE PRECISION NOT NULL,
    "employerCostUSD" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployerCostData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_categories" (
    "category_id" SERIAL NOT NULL,
    "category_name" TEXT NOT NULL,
    "description" TEXT,
    "monthly_cost" DOUBLE PRECISION DEFAULT 0,

    CONSTRAINT "role_categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "LSGCalculatorLead" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "baseSalary" DOUBLE PRECISION NOT NULL,
    "fteCount" INTEGER NOT NULL,
    "roleCategoryKey" INTEGER NOT NULL,
    "totalEmployerLoad" DOUBLE PRECISION NOT NULL,
    "employerExtras" DOUBLE PRECISION NOT NULL,
    "inHouseTotalCost" DOUBLE PRECISION NOT NULL,
    "lsgCost" DOUBLE PRECISION NOT NULL,
    "annualSavingsPercentage" DOUBLE PRECISION NOT NULL,
    "inclusions" JSONB,
    "roleCategoryName" TEXT,
    "costBreakdown" JSONB,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LSGCalculatorLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Roles" (
    "role_id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "role_name" TEXT NOT NULL,
    "region" TEXT,
    "seniority" TEXT,
    "active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateIndex
CREATE INDEX "EmployerCostData_category_idx" ON "EmployerCostData"("category");

-- CreateIndex
CREATE INDEX "EmployerCostData_state_idx" ON "EmployerCostData"("state");

-- CreateIndex
CREATE UNIQUE INDEX "EmployerCostData_state_category_item_key" ON "EmployerCostData"("state", "category", "item");

-- CreateIndex
CREATE UNIQUE INDEX "role_categories_category_name_key" ON "role_categories"("category_name");

-- CreateIndex
CREATE INDEX "LSGCalculatorLead_companyName_idx" ON "LSGCalculatorLead"("companyName");

-- CreateIndex
CREATE INDEX "LSGCalculatorLead_createdAt_idx" ON "LSGCalculatorLead"("createdAt");

-- CreateIndex
CREATE INDEX "LSGCalculatorLead_email_idx" ON "LSGCalculatorLead"("email");

-- AddForeignKey
ALTER TABLE "Roles" ADD CONSTRAINT "Roles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "role_categories"("category_id") ON DELETE CASCADE ON UPDATE NO ACTION;

