-- CreateTable
CREATE TABLE "Offer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "offerId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "validUntil" DATETIME
);

-- CreateTable
CREATE TABLE "Terms" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "offerId" INTEGER NOT NULL,
    "minPurchaseAmount" REAL NOT NULL,
    "discountPercentage" REAL NOT NULL,
    "maxDiscountAmount" REAL NOT NULL,
    CONSTRAINT "Terms_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bank" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "offerId" INTEGER NOT NULL,
    CONSTRAINT "Bank_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "offerId" INTEGER NOT NULL,
    CONSTRAINT "PaymentMethod_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Offer_offerId_key" ON "Offer"("offerId");

-- CreateIndex
CREATE UNIQUE INDEX "Terms_offerId_key" ON "Terms"("offerId");
