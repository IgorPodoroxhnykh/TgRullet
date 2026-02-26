-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PrizeStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'SHIPPED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TokenTransactionType" AS ENUM ('PURCHASE', 'BONUS', 'SPIN_SPEND', 'REFUND', 'ADMIN_ADD', 'ADMIN_REMOVE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "username" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "login" TEXT,
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tokenBalance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prizes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "probability" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "redeemedCount" INTEGER NOT NULL DEFAULT 0,
    "isValuable" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spin_histories" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prizeId" TEXT,
    "tokensSpent" INTEGER NOT NULL DEFAULT 1,
    "wheelIndex" INTEGER,
    "seed" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spin_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_prizes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prizeId" TEXT NOT NULL,
    "spinId" TEXT NOT NULL,
    "status" "PrizeStatus" NOT NULL DEFAULT 'PENDING',
    "claimedAt" TIMESTAMP(3),
    "shippedAt" TIMESTAMP(3),
    "contactInfo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_prizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "TokenTransactionType" NOT NULL,
    "description" TEXT,
    "paymentId" TEXT,
    "price" DOUBLE PRECISION,
    "currency" TEXT DEFAULT 'RUB',
    "balanceAfter" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT NOT NULL,
    "externalId" TEXT,
    "tokensAmount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "winners" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "prizeId" TEXT NOT NULL,
    "isIssued" BOOLEAN NOT NULL DEFAULT false,
    "issuedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "winners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_telegramId_key" ON "users"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "users_login_key" ON "users"("login");

-- AddForeignKey
ALTER TABLE "spin_histories" ADD CONSTRAINT "spin_histories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spin_histories" ADD CONSTRAINT "spin_histories_prizeId_fkey" FOREIGN KEY ("prizeId") REFERENCES "prizes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_prizes" ADD CONSTRAINT "user_prizes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_prizes" ADD CONSTRAINT "user_prizes_prizeId_fkey" FOREIGN KEY ("prizeId") REFERENCES "prizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_prizes" ADD CONSTRAINT "user_prizes_spinId_fkey" FOREIGN KEY ("spinId") REFERENCES "spin_histories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_transactions" ADD CONSTRAINT "token_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_transactions" ADD CONSTRAINT "token_transactions_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winners" ADD CONSTRAINT "winners_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winners" ADD CONSTRAINT "winners_prizeId_fkey" FOREIGN KEY ("prizeId") REFERENCES "prizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
