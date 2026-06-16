-- CreateEnum
CREATE TYPE "WorkoutSectionType" AS ENUM ('AMRAP', 'EMOM', 'FOR_TIME', 'TABATA');

-- CreateTable
CREATE TABLE "Workout" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "authorId" TEXT NOT NULL DEFAULT 'dev-user-1',
    "warmupType" "WorkoutSectionType",
    "warmupDescription" TEXT,
    "skillType" "WorkoutSectionType",
    "skillDescription" TEXT,
    "wodType" "WorkoutSectionType",
    "wodDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Block" (
    "id" TEXT NOT NULL,
    "reps" TEXT NOT NULL,
    "sets" INTEGER NOT NULL,
    "duration" TEXT,
    "order" INTEGER NOT NULL,
    "movementId" TEXT NOT NULL,
    "warmupOfId" TEXT,
    "skillOfId" TEXT,
    "wodOfId" TEXT,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Movement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Workout_date_idx" ON "Workout"("date");

-- CreateIndex
CREATE INDEX "Workout_authorId_idx" ON "Workout"("authorId");

-- CreateIndex
CREATE INDEX "Block_movementId_idx" ON "Block"("movementId");

-- CreateIndex
CREATE UNIQUE INDEX "Movement_name_key" ON "Movement"("name");

-- CreateIndex
CREATE INDEX "Movement_name_idx" ON "Movement"("name");

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_movementId_fkey" FOREIGN KEY ("movementId") REFERENCES "Movement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_warmupOfId_fkey" FOREIGN KEY ("warmupOfId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_skillOfId_fkey" FOREIGN KEY ("skillOfId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_wodOfId_fkey" FOREIGN KEY ("wodOfId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;
