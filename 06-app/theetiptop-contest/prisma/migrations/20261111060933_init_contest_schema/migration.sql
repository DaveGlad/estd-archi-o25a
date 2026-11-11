-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'EMPLOYEE', 'ADMIN');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'UNDISCLOSED');

-- CreateEnum
CREATE TYPE "CodeStatus" AS ENUM ('AVAILABLE', 'DISPENSED', 'USED', 'VOIDED');

-- CreateEnum
CREATE TYPE "PrizeStatus" AS ENUM ('TO_CLAIM', 'REDEEMED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "RedemptionChannel" AS ENUM ('IN_STORE', 'ONLINE');

-- CreateEnum
CREATE TYPE "PrizeType" AS ENUM ('TICKET_PRIZE', 'GRAND_PRIZE');

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "claimDeadline" TIMESTAMP(3) NOT NULL,
    "minimumPurchaseCents" INTEGER NOT NULL DEFAULT 4900,
    "plannedCodeCount" INTEGER NOT NULL DEFAULT 500000,
    "codeLength" INTEGER NOT NULL DEFAULT 10,
    "bailiffName" TEXT,
    "rulesUrl" TEXT,
    "rulesFiledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Draw" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "participantCount" INTEGER NOT NULL,
    "seed" TEXT NOT NULL,
    "participantsFingerprint" CHAR(64) NOT NULL,
    "winnerId" TEXT,
    "bailiffName" TEXT,
    "affidavitUrl" TEXT,

    CONSTRAINT "Draw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ticketCodeId" TEXT NOT NULL,
    "prizeStatus" "PrizeStatus" NOT NULL DEFAULT 'TO_CLAIM',
    "claimDeadline" TIMESTAMP(3) NOT NULL,
    "ipHash" CHAR(64),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Participation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prize" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "type" "PrizeType" NOT NULL DEFAULT 'TICKET_PRIZE',
    "valueCents" INTEGER NOT NULL,
    "targetPercentage" DECIMAL(5,2),
    "targetQuantity" INTEGER,
    "rank" INTEGER NOT NULL DEFAULT 0,
    "contestId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prize_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "postalCode" VARCHAR(5) NOT NULL,
    "city" TEXT NOT NULL,
    "phone" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "openedAt" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrizeRedemption" (
    "id" TEXT NOT NULL,
    "participationId" TEXT NOT NULL,
    "issuedById" TEXT NOT NULL,
    "storeId" TEXT,
    "channel" "RedemptionChannel" NOT NULL DEFAULT 'IN_STORE',
    "note" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrizeRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketCode" (
    "id" TEXT NOT NULL,
    "code" CHAR(10) NOT NULL,
    "prizeId" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "status" "CodeStatus" NOT NULL DEFAULT 'AVAILABLE',
    "dispensedAt" TIMESTAMP(3),
    "storeId" TEXT,
    "purchaseAmountCents" INTEGER,
    "dispenseReference" TEXT,
    "usedAt" TIMESTAMP(3),
    "voidedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "gender" "Gender" NOT NULL DEFAULT 'UNDISCLOSED',
    "birthDate" DATE,
    "postalCode" VARCHAR(5),
    "termsAcceptedAt" TIMESTAMP(3),
    "contestRulesAcceptedAt" TIMESTAMP(3),
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "marketingConsentAt" TIMESTAMP(3),
    "anonymizedAt" TIMESTAMP(3),
    "storeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_providerId_accountId_key" ON "Account"("providerId", "accountId");

-- CreateIndex
CREATE INDEX "Verification_identifier_idx" ON "Verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "Contest_slug_key" ON "Contest"("slug");

-- CreateIndex
CREATE INDEX "Contest_startsAt_endsAt_idx" ON "Contest"("startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "Draw_contestId_executedAt_idx" ON "Draw"("contestId", "executedAt");

-- CreateIndex
CREATE INDEX "Draw_winnerId_idx" ON "Draw"("winnerId");

-- CreateIndex
CREATE UNIQUE INDEX "Participation_ticketCodeId_key" ON "Participation"("ticketCodeId");

-- CreateIndex
CREATE INDEX "Participation_userId_createdAt_idx" ON "Participation"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Participation_prizeStatus_idx" ON "Participation"("prizeStatus");

-- CreateIndex
CREATE INDEX "Participation_createdAt_idx" ON "Participation"("createdAt");

-- CreateIndex
CREATE INDEX "Participation_claimDeadline_idx" ON "Participation"("claimDeadline");

-- CreateIndex
CREATE INDEX "Prize_contestId_type_idx" ON "Prize"("contestId", "type");

-- CreateIndex
CREATE INDEX "Prize_rank_idx" ON "Prize"("rank");

-- CreateIndex
CREATE UNIQUE INDEX "Prize_contestId_label_key" ON "Prize"("contestId", "label");

-- CreateIndex
CREATE INDEX "Store_city_idx" ON "Store"("city");

-- CreateIndex
CREATE INDEX "Store_active_idx" ON "Store"("active");

-- CreateIndex
CREATE UNIQUE INDEX "PrizeRedemption_participationId_key" ON "PrizeRedemption"("participationId");

-- CreateIndex
CREATE INDEX "PrizeRedemption_issuedById_idx" ON "PrizeRedemption"("issuedById");

-- CreateIndex
CREATE INDEX "PrizeRedemption_storeId_issuedAt_idx" ON "PrizeRedemption"("storeId", "issuedAt");

-- CreateIndex
CREATE INDEX "PrizeRedemption_issuedAt_idx" ON "PrizeRedemption"("issuedAt");

-- CreateIndex
CREATE UNIQUE INDEX "TicketCode_code_key" ON "TicketCode"("code");

-- CreateIndex
CREATE INDEX "TicketCode_status_idx" ON "TicketCode"("status");

-- CreateIndex
CREATE INDEX "TicketCode_prizeId_status_idx" ON "TicketCode"("prizeId", "status");

-- CreateIndex
CREATE INDEX "TicketCode_contestId_status_idx" ON "TicketCode"("contestId", "status");

-- CreateIndex
CREATE INDEX "TicketCode_usedAt_idx" ON "TicketCode"("usedAt");

-- CreateIndex
CREATE INDEX "TicketCode_storeId_status_idx" ON "TicketCode"("storeId", "status");

-- CreateIndex
CREATE INDEX "TicketCode_dispensedAt_idx" ON "TicketCode"("dispensedAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_storeId_idx" ON "User"("storeId");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE INDEX "User_marketingConsent_idx" ON "User"("marketingConsent");

-- CreateIndex
CREATE INDEX "User_gender_birthDate_idx" ON "User"("gender", "birthDate");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draw" ADD CONSTRAINT "Draw_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draw" ADD CONSTRAINT "Draw_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_ticketCodeId_fkey" FOREIGN KEY ("ticketCodeId") REFERENCES "TicketCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prize" ADD CONSTRAINT "Prize_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrizeRedemption" ADD CONSTRAINT "PrizeRedemption_participationId_fkey" FOREIGN KEY ("participationId") REFERENCES "Participation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrizeRedemption" ADD CONSTRAINT "PrizeRedemption_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrizeRedemption" ADD CONSTRAINT "PrizeRedemption_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketCode" ADD CONSTRAINT "TicketCode_prizeId_fkey" FOREIGN KEY ("prizeId") REFERENCES "Prize"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketCode" ADD CONSTRAINT "TicketCode_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketCode" ADD CONSTRAINT "TicketCode_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
