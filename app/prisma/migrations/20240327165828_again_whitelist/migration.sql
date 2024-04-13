/*
  Warnings:

  - A unique constraint covering the columns `[otp]` on the table `Whitelist` will be added. If there are existing duplicate values, this will fail.
  - Made the column `otp` on table `Whitelist` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Whitelist" ALTER COLUMN "otp" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Whitelist_otp_key" ON "Whitelist"("otp");
