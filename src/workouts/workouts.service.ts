import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { FindWorkoutsDto } from './dto/find-workouts.dto';

@Injectable()
export class WorkoutsService {
  private readonly blockInclude = { include: { movement: true } };
  private readonly workoutInclude = {
    include: {
      warmup: this.blockInclude,
      skill: this.blockInclude,
      wod: this.blockInclude,
    },
  };

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateWorkoutDto, authorId?: string) {
    const workoutDate = new Date(dto.date);
    const dateFilter = this.buildDateFilter(dto.date);

    // Verificar se já existe treino nesta data
    const existingWorkout = await this.prisma.workout.findFirst({
      where: dateFilter,
    });

    if (existingWorkout) {
      throw new BadRequestException('Já existe um treino nesta data');
    }

    const {
      warmup,
      skill,
      wod,
      warmupMovements,
      skillMovements,
      wodMovements,
      warmupType,
      warmupDescription,
      skillType,
      skillDescription,
      wodType,
      wodDescription,
      ...restData
    } = dto;

    const { warmupBlocks, skillBlocks, wodBlocks } = this.buildBlocksFromMovements({
      warmupMovements,
      skillMovements,
      wodMovements,
      workoutDate,
    });

    return this.prisma.workout.create({
      data: {
        ...restData,
        authorId: authorId || 'dev-user-1',
        date: workoutDate,
        warmupType: warmupType || null,
        warmupDescription: warmupDescription || null,
        skillType: skillType || null,
        skillDescription: skillDescription || null,
        wodType: wodType || null,
        wodDescription: wodDescription || null,
        warmup: {
          create: warmup?.length
            ? warmup.map((b) => ({ ...b, workoutDate }))
            : warmupBlocks,
        },

        skill: {
          create: skill?.length
            ? skill.map((b) => ({ ...b, workoutDate }))
            : skillBlocks,
        },

        wod: {
          create: wod?.length
            ? wod.map((b) => ({ ...b, workoutDate }))
            : wodBlocks,
        },
      },
      ...this.workoutInclude,
    });
  }

  async findAll(query?: FindWorkoutsDto) {
    const where = this.buildWhereClause(query);
    const orderBy = { [query?.sortBy || 'date']: query?.order || 'desc' };
    const skip = ((query?.page || 1) - 1) * (query?.limit || 10);
    const take = query?.limit || 10;

    const [workouts, total] = await Promise.all([
      this.prisma.workout.findMany({
        where,
        ...this.workoutInclude,
        orderBy,
        skip,
        take,
      }),
      this.prisma.workout.count({ where }),
    ]);

    const totalPages = Math.ceil(total / take);

    return {
      data: workouts,
      pagination: {
        total,
        page: query?.page || 1,
        limit: take,
        totalPages,
      },
    };
  }

  async findOne(id: string) {
    const workout = await this.prisma.workout.findUnique({
      where: { id },
      ...this.workoutInclude,
    });
    if (!workout) {
      throw new NotFoundException(`Treino #${id} não encontrado`);
    }
    return workout;
  }

  async update(id: string, dto: CreateWorkoutDto) {
    const workout = await this.findOne(id);
    const newDate = new Date(dto.date);
    const dateFilter = this.buildDateFilter(dto.date);

    // Verificar se a nova data já existe (e não é a data atual do treino)
    if (
      workout.date.toISOString().split('T')[0] !==
      newDate.toISOString().split('T')[0]
    ) {
      const existingWorkout = await this.prisma.workout.findFirst({
        where: {
          ...dateFilter,
          NOT: { id },
        },
      });

      if (existingWorkout) {
        throw new BadRequestException('Já existe um treino nesta data');
      }
    }

    const {
      warmup,
      skill,
      wod,
      warmupMovements,
      skillMovements,
      wodMovements,
      warmupType,
      warmupDescription,
      skillType,
      skillDescription,
      wodType,
      wodDescription,
      ...restData
    } = dto;

    const { warmupBlocks, skillBlocks, wodBlocks } = this.buildBlocksFromMovements({
      warmupMovements,
      skillMovements,
      wodMovements,
      workoutDate: newDate,
    });

    return this.prisma.workout.update({
      where: { id },
      data: {
        ...restData,
        date: newDate,
        warmupType: warmupType || null,
        warmupDescription: warmupDescription || null,
        skillType: skillType || null,
        skillDescription: skillDescription || null,
        wodType: wodType || null,
        wodDescription: wodDescription || null,
        warmup: {
          deleteMany: {},
          create: warmup
            ? warmup.map((b) => ({ ...b, workoutDate: newDate }))
            : warmupBlocks,
        },
        skill: {
          deleteMany: {},
          create: skill
            ? skill.map((b) => ({ ...b, workoutDate: newDate }))
            : skillBlocks,
        },
        wod: {
          deleteMany: {},
          create: wod
            ? wod.map((b) => ({ ...b, workoutDate: newDate }))
            : wodBlocks,
        },
      },
      ...this.workoutInclude,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.workout.delete({ where: { id } });
  }

  private buildBlocksFromMovements({
    warmupMovements,
    skillMovements,
    wodMovements,
    workoutDate,
  }: {
    warmupMovements?: string[];
    skillMovements?: string[];
    wodMovements?: string[];
    workoutDate: Date;
  }) {
    const warmupBlocks =
      warmupMovements?.map((movementId, index) => ({
        movementId,
        order: index,
        reps: '-',
        workoutDate,
      })) || [];

    const skillBlocks =
      skillMovements?.map((movementId, index) => ({
        movementId,
        order: index,
        reps: '-',
        workoutDate,
      })) || [];

    const wodBlocks =
      wodMovements?.map((movementId, index) => ({
        movementId,
        order: index,
        reps: '-',
        workoutDate,
      })) || [];

    return { warmupBlocks, skillBlocks, wodBlocks };
  }

  private buildDateFilter(date: string) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    return { date: { gte: startDate, lt: endDate } };
  }

  private buildWhereClause(
    query?: FindWorkoutsDto,
  ): Prisma.WorkoutWhereInput | undefined {
    if (!query) return undefined;

    const where: Prisma.WorkoutWhereInput = {};

    if (query.date) {
      return this.buildDateFilter(query.date);
    }

    if (query.startDate && query.endDate) {
      const startDate = new Date(query.startDate);
      const endDate = new Date(query.endDate);
      endDate.setDate(endDate.getDate() + 1);
      where.date = { gte: startDate, lt: endDate };
    } else if (query.startDate) {
      where.date = { gte: new Date(query.startDate) };
    } else if (query.endDate) {
      const endDate = new Date(query.endDate);
      endDate.setDate(endDate.getDate() + 1);
      where.date = { lt: endDate };
    }

    return Object.keys(where).length > 0 ? where : undefined;
  }
}
