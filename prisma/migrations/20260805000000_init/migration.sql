
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('TENANT', 'SUPPORT', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "PumpMode" AS ENUM ('AUTO', 'MANUAL');

-- CreateEnum
CREATE TYPE "CommandAction" AS ENUM ('PUMP_ON', 'PUMP_OFF');

-- CreateEnum
CREATE TYPE "CommandStatus" AS ENUM ('PENDING', 'SENT', 'CONFIRMED', 'FAILED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ActorKind" AS ENUM ('AUTO', 'USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AlertCondition" AS ENUM ('SOIL_BELOW', 'TEMP_BELOW', 'TEMP_ABOVE', 'HUMIDITY_BELOW', 'HUMIDITY_ABOVE');

-- CreateEnum
CREATE TYPE "SmsStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'UNDELIVERED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('LOGIN_SUCCESS', 'LOGIN_FAILURE', 'LOGOUT', 'DEVICE_PROVISIONED', 'DEVICE_CLAIMED', 'DEVICE_UNCLAIMED', 'DEVICE_VIEWED', 'API_KEY_REGENERATED', 'COMMAND_ISSUED', 'CALIBRATION_SET', 'ALERT_RULES_UPDATED', 'PASSWORD_CHANGED');

-- CreateTable
CREATE TABLE "login_attempts" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneE164" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "name" TEXT NOT NULL,
    "phoneE164" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'TENANT',
    "phoneVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "mac" TEXT NOT NULL,
    "label" TEXT,
    "tenantId" TEXT,
    "apiKeyHash" TEXT NOT NULL,
    "firmware" TEXT NOT NULL DEFAULT 'v1.4.2',
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "lastSeenAt" TIMESTAMP(3),
    "signalDbm" INTEGER,
    "batteryV" DOUBLE PRECISION,
    "uptimeSeconds" INTEGER,
    "mode" "PumpMode" NOT NULL DEFAULT 'AUTO',
    "relayOn" BOOLEAN NOT NULL DEFAULT false,
    "claimedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claim_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "consumedAt" TIMESTAMP(3),
    "consumedByTenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "claim_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calibrations" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "dryRaw" INTEGER NOT NULL,
    "wetRaw" INTEGER NOT NULL,
    "setByUserId" TEXT,
    "setAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calibrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "readings" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "soilRaw" INTEGER NOT NULL,
    "soilPct" INTEGER,
    "tempC" DOUBLE PRECISION,
    "humidityPct" DOUBLE PRECISION,
    "lightLux" INTEGER,
    "relayOn" BOOLEAN NOT NULL,
    "mode" "PumpMode" NOT NULL,
    "signalDbm" INTEGER,
    "batteryV" DOUBLE PRECISION,

    CONSTRAINT "readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commands" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "tenantId" TEXT,
    "action" "CommandAction" NOT NULL,
    "status" "CommandStatus" NOT NULL DEFAULT 'PENDING',
    "actorKind" "ActorKind" NOT NULL,
    "actorUserId" TEXT,
    "actorName" TEXT NOT NULL,
    "maxRunSeconds" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "stopReason" TEXT,

    CONSTRAINT "commands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "irrigation_events" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "trigger" "PumpMode" NOT NULL,
    "stopReason" TEXT NOT NULL,

    CONSTRAINT "irrigation_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_rules" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "condition" "AlertCondition" NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "clearThreshold" DOUBLE PRECISION NOT NULL,
    "cooldownMinutes" INTEGER NOT NULL DEFAULT 60,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "alert_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "condition" "AlertCondition" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "firedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clearedAt" TIMESTAMP(3),
    "notifiedAt" TIMESTAMP(3),
    "suppressedReason" TEXT,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_recipients" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "phoneE164" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "sms_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_messages" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "deviceId" TEXT,
    "alertId" TEXT,
    "toPhoneE164" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "SmsStatus" NOT NULL DEFAULT 'QUEUED',
    "providerRef" TEXT,
    "failureReason" TEXT,
    "costMinor" INTEGER,
    "costCurrency" TEXT NOT NULL DEFAULT 'GHS',
    "queuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "sms_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "actorName" TEXT NOT NULL,
    "tenantId" TEXT,
    "deviceId" TEXT,
    "action" "AuditAction" NOT NULL,
    "details" TEXT NOT NULL,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "login_attempts_identifier_key" ON "login_attempts"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_phoneE164_key" ON "tenants"("phoneE164");

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneE164_key" ON "users"("phoneE164");

-- CreateIndex
CREATE INDEX "users_tenantId_idx" ON "users"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "devices_mac_key" ON "devices"("mac");

-- CreateIndex
CREATE UNIQUE INDEX "claim_codes_code_key" ON "claim_codes"("code");

-- CreateIndex
CREATE INDEX "claim_codes_deviceId_idx" ON "claim_codes"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "calibrations_deviceId_key" ON "calibrations"("deviceId");

-- CreateIndex
CREATE INDEX "readings_deviceId_recordedAt_idx" ON "readings"("deviceId", "recordedAt" DESC);

-- CreateIndex
CREATE INDEX "commands_deviceId_createdAt_idx" ON "commands"("deviceId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "commands_deviceId_status_idx" ON "commands"("deviceId", "status");

-- CreateIndex
CREATE INDEX "irrigation_events_deviceId_startedAt_idx" ON "irrigation_events"("deviceId", "startedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "alert_rules_deviceId_condition_key" ON "alert_rules"("deviceId", "condition");

-- CreateIndex
CREATE INDEX "alerts_deviceId_firedAt_idx" ON "alerts"("deviceId", "firedAt" DESC);

-- CreateIndex
CREATE INDEX "sms_recipients_deviceId_idx" ON "sms_recipients"("deviceId");

-- CreateIndex
CREATE INDEX "sms_messages_tenantId_queuedAt_idx" ON "sms_messages"("tenantId", "queuedAt" DESC);

-- CreateIndex
CREATE INDEX "audit_log_createdAt_idx" ON "audit_log"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "audit_log_tenantId_createdAt_idx" ON "audit_log"("tenantId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_codes" ADD CONSTRAINT "claim_codes_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_codes" ADD CONSTRAINT "claim_codes_consumedByTenantId_fkey" FOREIGN KEY ("consumedByTenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calibrations" ADD CONSTRAINT "calibrations_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calibrations" ADD CONSTRAINT "calibrations_setByUserId_fkey" FOREIGN KEY ("setByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readings" ADD CONSTRAINT "readings_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commands" ADD CONSTRAINT "commands_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commands" ADD CONSTRAINT "commands_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commands" ADD CONSTRAINT "commands_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "irrigation_events" ADD CONSTRAINT "irrigation_events_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_rules" ADD CONSTRAINT "alert_rules_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_rules" ADD CONSTRAINT "alert_rules_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "alert_rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_recipients" ADD CONSTRAINT "sms_recipients_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_messages" ADD CONSTRAINT "sms_messages_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_messages" ADD CONSTRAINT "sms_messages_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_messages" ADD CONSTRAINT "sms_messages_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "alerts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

