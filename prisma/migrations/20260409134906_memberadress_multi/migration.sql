/*
  Warnings:

  - A unique constraint covering the columns `[memberId,stateRegistration]` on the table `MemberAdress` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "MemberAdress_memberId_key";

-- CreateIndex
CREATE INDEX "MemberAdress_memberId_idx" ON "MemberAdress"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "MemberAdress_memberId_stateRegistration_key" ON "MemberAdress"("memberId", "stateRegistration");
