-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastReminderOn" TEXT,
ADD COLUMN     "reminderEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reminderHour" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'Africa/Addis_Ababa';
