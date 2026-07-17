CREATE TYPE "ExpenseCategory" AS ENUM ('FUEL', 'UNION_TICKET', 'MAINTENANCE', 'OTHER');

CREATE TABLE "Expense" (
  "id" UUID NOT NULL,
  "driverId" UUID NOT NULL,
  "category" "ExpenseCategory" NOT NULL,
  "amountKobo" BIGINT NOT NULL,
  "note" TEXT,
  "incurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Expense_driverId_incurredAt_idx" ON "Expense"("driverId", "incurredAt");

ALTER TABLE "Expense" ADD CONSTRAINT "Expense_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;
