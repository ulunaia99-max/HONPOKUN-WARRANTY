-- CreateTable
CREATE TABLE "WarrantyRegistration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "managementId" TEXT NOT NULL,
    "phone" TEXT,
    "fullName" TEXT,
    "furigana" TEXT,
    "postalCode" TEXT,
    "address" TEXT,
    "maker" TEXT,
    "model" TEXT,
    "serial" TEXT,
    "purchaseSite" TEXT,
    "purchaseDate" TEXT,
    "warrantyPeriod" INTEGER,
    "warrantyPlan" TEXT,
    "warrantyEndDate" TEXT,
    "reviewPledge" BOOLEAN NOT NULL DEFAULT false,
    "termsAgreed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "WarrantyRegistration_managementId_key" ON "WarrantyRegistration"("managementId");

-- CreateIndex
CREATE INDEX "WarrantyRegistration_managementId_idx" ON "WarrantyRegistration"("managementId");
