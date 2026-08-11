-- AlterTable
ALTER TABLE "devices" ADD COLUMN "slug" TEXT;

-- Backfill from label / mac
UPDATE "devices"
SET "slug" = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      COALESCE(
        NULLIF(TRIM("label"), ''),
        CONCAT('device-', RIGHT(REGEXP_REPLACE("mac", '[^a-zA-Z0-9]', '', 'g'), 6))
      ),
      '[^a-zA-Z0-9]+',
      '-',
      'g'
    ),
    '(^-|-$)',
    '',
    'g'
  )
);

-- Deduplicate collisions by appending -<short id>
UPDATE "devices" d
SET "slug" = d."slug" || '-' || LEFT(d."id", 6)
WHERE d."id" IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY "createdAt") AS rn
    FROM "devices"
  ) ranked
  WHERE ranked.rn > 1
);

-- Ensure no nulls / empty
UPDATE "devices" SET "slug" = CONCAT('device-', LEFT("id", 8)) WHERE "slug" IS NULL OR "slug" = '';

-- AlterTable
ALTER TABLE "devices" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "devices_slug_key" ON "devices"("slug");
