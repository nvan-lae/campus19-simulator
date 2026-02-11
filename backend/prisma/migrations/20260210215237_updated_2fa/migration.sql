/*
  Warnings:

  - You are about to drop the column `isTwoFactorEnabled` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `twoFactorMethod` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `twoFactorSecret` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `twoFactorTempSecret` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "isTwoFactorEnabled",
DROP COLUMN "twoFactorMethod",
DROP COLUMN "twoFactorSecret",
DROP COLUMN "twoFactorTempSecret",
ADD COLUMN     "twoFactorConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorRecoveryHashes" TEXT,
ADD COLUMN     "twoFactorSecretEncrypted" TEXT;
