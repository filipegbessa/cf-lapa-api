-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_movementId_fkey";

-- AlterTable
ALTER TABLE "Block" ADD COLUMN     "name" TEXT,
ADD COLUMN     "totalReps" INTEGER,
ALTER COLUMN "sets" DROP NOT NULL,
ALTER COLUMN "sets" SET DATA TYPE TEXT,
ALTER COLUMN "movementId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_movementId_fkey" FOREIGN KEY ("movementId") REFERENCES "Movement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
