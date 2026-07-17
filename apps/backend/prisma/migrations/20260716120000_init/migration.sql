CREATE TYPE "KycLevel" AS ENUM ('BASIC', 'VERIFIED', 'BUSINESS');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');
CREATE TYPE "LedgerEntryType" AS ENUM ('CREDIT', 'DEBIT');
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'SMS', 'FCM');
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

CREATE TABLE "Driver" (
  "id" UUID NOT NULL, "publicId" TEXT NOT NULL, "fullName" TEXT NOT NULL,
  "phone" TEXT NOT NULL, "email" TEXT, "consentedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "OtpChallenge" (
  "id" UUID NOT NULL, "phone" TEXT NOT NULL, "codeHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL, "verifiedAt" TIMESTAMP(3), "attempts" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "OtpChallenge_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AuthSession" (
  "id" UUID NOT NULL, "tokenHash" TEXT NOT NULL, "phone" TEXT NOT NULL, "driverId" UUID,
  "expiresAt" TIMESTAMP(3) NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "KycProfile" (
  "id" UUID NOT NULL, "driverId" UUID NOT NULL, "level" "KycLevel" NOT NULL DEFAULT 'BASIC',
  "address" TEXT, "bvnVerified" BOOLEAN NOT NULL DEFAULT false, "ninVerified" BOOLEAN NOT NULL DEFAULT false,
  "unionName" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "KycProfile_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "WalletAccount" (
  "id" UUID NOT NULL, "driverId" UUID NOT NULL, "provider" TEXT NOT NULL DEFAULT 'WEMA_MOCK',
  "accountNumber" TEXT NOT NULL, "accountName" TEXT NOT NULL, "bankCode" TEXT NOT NULL DEFAULT '035',
  "balanceKobo" BIGINT NOT NULL DEFAULT 0, "providerReference" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WalletAccount_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Payment" (
  "id" UUID NOT NULL, "orderId" TEXT NOT NULL, "driverId" UUID NOT NULL, "amountKobo" BIGINT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'NGN', "description" TEXT, "customerName" TEXT NOT NULL,
  "customerEmail" TEXT NOT NULL, "customerPhone" TEXT, "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "provider" TEXT NOT NULL DEFAULT 'ALATPAY_MOCK', "providerTransactionId" TEXT, "providerPayload" JSONB,
  "completedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "LedgerEntry" (
  "id" UUID NOT NULL, "walletId" UUID NOT NULL, "paymentId" UUID, "type" "LedgerEntryType" NOT NULL,
  "amountKobo" BIGINT NOT NULL, "description" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Notification" (
  "id" UUID NOT NULL, "driverId" UUID NOT NULL, "channel" "NotificationChannel" NOT NULL,
  "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING', "title" TEXT NOT NULL, "message" TEXT NOT NULL,
  "readAt" TIMESTAMP(3), "sentAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Driver_publicId_key" ON "Driver"("publicId");
CREATE UNIQUE INDEX "Driver_phone_key" ON "Driver"("phone");
CREATE INDEX "OtpChallenge_phone_createdAt_idx" ON "OtpChallenge"("phone", "createdAt");
CREATE UNIQUE INDEX "AuthSession_tokenHash_key" ON "AuthSession"("tokenHash");
CREATE INDEX "AuthSession_phone_idx" ON "AuthSession"("phone");
CREATE INDEX "AuthSession_driverId_idx" ON "AuthSession"("driverId");
CREATE UNIQUE INDEX "KycProfile_driverId_key" ON "KycProfile"("driverId");
CREATE UNIQUE INDEX "WalletAccount_driverId_key" ON "WalletAccount"("driverId");
CREATE UNIQUE INDEX "WalletAccount_accountNumber_key" ON "WalletAccount"("accountNumber");
CREATE UNIQUE INDEX "WalletAccount_providerReference_key" ON "WalletAccount"("providerReference");
CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");
CREATE UNIQUE INDEX "Payment_providerTransactionId_key" ON "Payment"("providerTransactionId");
CREATE INDEX "Payment_driverId_createdAt_idx" ON "Payment"("driverId", "createdAt");
CREATE INDEX "Payment_status_idx" ON "Payment"("status");
CREATE UNIQUE INDEX "LedgerEntry_paymentId_key" ON "LedgerEntry"("paymentId");
CREATE INDEX "LedgerEntry_walletId_createdAt_idx" ON "LedgerEntry"("walletId", "createdAt");
CREATE INDEX "Notification_driverId_createdAt_idx" ON "Notification"("driverId", "createdAt");

ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KycProfile" ADD CONSTRAINT "KycProfile_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WalletAccount" ADD CONSTRAINT "WalletAccount_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "WalletAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;
