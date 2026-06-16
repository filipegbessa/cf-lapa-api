import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { FindWorkoutsDto } from './dto/find-workouts.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('workouts')
export class WorkoutsController {
  constructor(private service: WorkoutsService) {}

  @Get()
  findAll(@Query() query: FindWorkoutsDto) {
    return this.service.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateWorkoutDto, @Req() req: Record<string, unknown>) {
    const headers = req.headers as Record<string, unknown>;
    const authorId = (headers['x-user-id'] as string) || '';
    return this.service.create(dto, authorId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CreateWorkoutDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
