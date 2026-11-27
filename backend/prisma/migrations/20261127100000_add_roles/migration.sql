-- RBAC: the ROLE table with the six roles of Asset Management 2.0, and every
-- user pointing at one of them through user.role -> role.key.

-- CreateTable
CREATE TABLE "role" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dashboard" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "role_key_key" ON "role"("key");

-- CreateIndex
CREATE UNIQUE INDEX "role_name_key" ON "role"("name");

-- Seed the six system roles (SOW + employee-flow doc).
INSERT INTO "role" ("key", "name", "description", "dashboard", "isSystem", "status", "updatedAt") VALUES
  ('admin',         'Admin',         'Full access to every module, approvals, setup and app preferences.', 'admin',         true, 'Active', CURRENT_TIMESTAMP),
  ('employee',      'Employee',      'Raises requests and complaints; sees only their own requests and assets.', 'employee', true, 'Active', CURRENT_TIMESTAMP),
  ('procurer',      'Procurer',      'Raises purchase orders and invoices; manages inventory.', 'procurer',      true, 'Active', CURRENT_TIMESTAMP),
  ('technician',    'Technician',    'Works on work orders and preventive maintenance.', 'technician',    true, 'Active', CURRENT_TIMESTAMP),
  ('asset_manager', 'Asset manager', 'Looks after assets, inventory and maintenance.', 'asset_manager', true, 'Active', CURRENT_TIMESTAMP),
  ('vendor',        'Vendor',        'Supplies products against purchase orders.', 'vendor',        true, 'Active', CURRENT_TIMESTAMP);

-- Existing users had the old placeholder roles ("user", "manager").
-- "admin" keeps its meaning; everything else becomes "employee".
UPDATE "user" SET "role" = 'employee' WHERE "role" NOT IN (SELECT "key" FROM "role");

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'employee';

-- CreateIndex
CREATE INDEX "user_role_idx" ON "user"("role");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_role_fkey" FOREIGN KEY ("role") REFERENCES "role"("key") ON DELETE RESTRICT ON UPDATE CASCADE;
