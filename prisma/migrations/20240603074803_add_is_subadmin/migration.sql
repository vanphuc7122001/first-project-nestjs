-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_verify_token" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "is_sub_admin" BOOLEAN NOT NULL DEFAULT false;
