-- AlterTable
ALTER TABLE "Block" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN "workoutDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Block_workoutDate_idx" ON "Block"("workoutDate");
