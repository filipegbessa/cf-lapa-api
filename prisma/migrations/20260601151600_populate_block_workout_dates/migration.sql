-- Update blocks with workout dates from their related workouts
UPDATE "Block" b
SET "workoutDate" = w."date"
FROM "Workout" w
WHERE b."warmupOfId" = w."id" AND b."workoutDate" IS NULL;

UPDATE "Block" b
SET "workoutDate" = w."date"
FROM "Workout" w
WHERE b."skillOfId" = w."id" AND b."workoutDate" IS NULL;

UPDATE "Block" b
SET "workoutDate" = w."date"
FROM "Workout" w
WHERE b."wodOfId" = w."id" AND b."workoutDate" IS NULL;

-- Make workoutDate NOT NULL
ALTER TABLE "Block" ALTER COLUMN "workoutDate" SET NOT NULL;
