import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateMovementDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  abbreviation?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
