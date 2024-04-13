/*
  Warnings:

  - You are about to drop the column `checked` on the `Version` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CheckStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED');

-- AlterTable
ALTER TABLE "Version" DROP COLUMN "checked",
ADD COLUMN     "checkedStatus" "CheckStatus" NOT NULL DEFAULT 'PENDING';
