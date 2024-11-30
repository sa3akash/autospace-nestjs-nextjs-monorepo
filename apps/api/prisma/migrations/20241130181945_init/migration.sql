/*
  Warnings:

  - A unique constraint covering the columns `[providerAccountId]` on the table `AuthProvider` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AuthProvider_providerAccountId_key" ON "AuthProvider"("providerAccountId");
