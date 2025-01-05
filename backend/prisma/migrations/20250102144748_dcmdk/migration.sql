/*
  Warnings:

  - You are about to drop the column `retiredById` on the `CreditRetirement` table. All the data in the column will be lost.
  - You are about to drop the column `auditorInfo` on the `NFT` table. All the data in the column will be lost.
  - You are about to drop the column `creditType` on the `NFT` table. All the data in the column will be lost.
  - You are about to drop the column `isRetired` on the `NFT` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `NFT` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `NFT` table. All the data in the column will be lost.
  - You are about to drop the column `tokenURI` on the `NFT` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `NFT` table. All the data in the column will be lost.
  - You are about to drop the column `verificationDetails` on the `NFT` table. All the data in the column will be lost.
  - You are about to drop the column `buyerId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `sellerId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `wallet_address` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Marketplace` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `walletAddress` to the `CreditRetirement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `certificateURI` to the `NFT` table without a default value. This is not possible if the table is not empty.
  - Added the required column `walletAddress` to the `NFT` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buyerWallet` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerWallet` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CreditRetirement" DROP CONSTRAINT "CreditRetirement_retiredById_fkey";

-- DropForeignKey
ALTER TABLE "Marketplace" DROP CONSTRAINT "Marketplace_nftId_fkey";

-- DropForeignKey
ALTER TABLE "NFT" DROP CONSTRAINT "NFT_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_buyerId_fkey";

-- AlterTable
ALTER TABLE "CreditRetirement" DROP COLUMN "retiredById",
ADD COLUMN     "walletAddress" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "NFT" DROP COLUMN "auditorInfo",
DROP COLUMN "creditType",
DROP COLUMN "isRetired",
DROP COLUMN "ownerId",
DROP COLUMN "quantity",
DROP COLUMN "tokenURI",
DROP COLUMN "updatedAt",
DROP COLUMN "verificationDetails",
ADD COLUMN     "certificateURI" TEXT NOT NULL,
ADD COLUMN     "walletAddress" TEXT NOT NULL,
ALTER COLUMN "price" DROP DEFAULT,
ALTER COLUMN "price" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "buyerId",
DROP COLUMN "sellerId",
ADD COLUMN     "buyerWallet" TEXT NOT NULL,
ADD COLUMN     "sellerWallet" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerified",
DROP COLUMN "wallet_address";

-- DropTable
DROP TABLE "Marketplace";

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_address_key" ON "Wallet"("address");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NFT" ADD CONSTRAINT "NFT_walletAddress_fkey" FOREIGN KEY ("walletAddress") REFERENCES "Wallet"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditRetirement" ADD CONSTRAINT "CreditRetirement_walletAddress_fkey" FOREIGN KEY ("walletAddress") REFERENCES "Wallet"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
