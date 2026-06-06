/*
  Warnings:

  - You are about to drop the `OtpRecord` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OtpRecord" DROP CONSTRAINT "OtpRecord_userId_fkey";

-- DropTable
DROP TABLE "OtpRecord";
