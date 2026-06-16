import {
  IsString,
  IsDateString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  IsNumber,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WorkoutSectionType } from '@prisma/client';

export class CreateBlockDto {
  @IsOptional()
  @IsString()
  movementId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsString()
  @MinLength(1)
  reps: string;

  @IsOptional()
  @IsNumber()
  totalReps?: number;

  @IsOptional()
  @IsString()
  sets?: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsNumber()
  order: number;

  @IsOptional()
  @IsDateString()
  workoutDate?: string;
}

export class CreateWorkoutDto {
  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(WorkoutSectionType)
  warmupType?: WorkoutSectionType;

  @IsOptional()
  @IsString()
  warmupDescription?: string;

  @IsOptional()
  @IsEnum(WorkoutSectionType)
  skillType?: WorkoutSectionType;

  @IsOptional()
  @IsString()
  skillDescription?: string;

  @IsOptional()
  @IsEnum(WorkoutSectionType)
  wodType?: WorkoutSectionType;

  @IsOptional()
  @IsString()
  wodDescription?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  warmupMovements?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skillMovements?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  wodMovements?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBlockDto)
  warmup?: CreateBlockDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBlockDto)
  skill?: CreateBlockDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBlockDto)
  wod?: CreateBlockDto[];
}
