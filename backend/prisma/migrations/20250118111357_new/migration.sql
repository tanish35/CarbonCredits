/*
  Warnings:

  - Added the required column `quantity` to the `CreditRetirement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CreditRetirement" ADD COLUMN     "quantity" INTEGER NOT NULL;
