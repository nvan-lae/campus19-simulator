-- CreateEnum
CREATE TYPE "TwoFactorMethod" AS ENUM ('totp', 'email', 'security_question');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "securityAnswerHash" TEXT,
ADD COLUMN     "securityQuestion" TEXT,
ADD COLUMN     "twoFactorMethod" "TwoFactorMethod",
ADD COLUMN     "twoFactorTempSecret" TEXT;
