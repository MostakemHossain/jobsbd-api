/*
  Warnings:

  - You are about to drop the column `phoneNubmer` on the `User` table. All the data in the column will be lost.
  - Added the required column `phoneNumber` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "phoneNubmer",
ADD COLUMN     "phoneNumber" TEXT NOT NULL;