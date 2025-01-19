-- CreateEnum
CREATE TYPE "AchievementType" AS ENUM ('Green_Pioneer', 'Water_Warrior', 'Energy_Expert', 'Air_Advocate');

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "AchievementType" NOT NULL DEFAULT 'Green_Pioneer',
    "description" TEXT NOT NULL DEFAULT 'Start your journey to become a Green Pioneer',
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
