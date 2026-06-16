import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovementDto } from './dto/create-movement.dto';
import { FindMovementsDto } from './dto/find-movements.dto';

@Injectable()
export class MovementsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateMovementDto) {
    return this.prisma.movement.create({ data });
  }

  async findAll(query?: FindMovementsDto) {
    const page = Math.max(1, query?.page || 1);
    const limit = Math.min(100, Math.max(1, query?.limit || 10));
    const where = this.buildWhereClauseForFindAll(query);
    const orderBy = { [query?.sortBy || 'name']: query?.order || 'asc' };
    const skip = (page - 1) * limit;

    const [movements, total] = await Promise.all([
      this.prisma.movement.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.movement.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: movements,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  private buildWhereClauseForFindAll(
    query?: FindMovementsDto,
  ): Prisma.MovementWhereInput | undefined {
    if (!query?.q) return undefined;

    return {
      OR: [
        { name: { contains: query.q, mode: Prisma.QueryMode.insensitive } },
        {
          abbreviation: {
            contains: query.q,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          description: {
            contains: query.q,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ],
    };
  }

  async findOne(id: string) {
    return this.prisma.movement.findUnique({ where: { id } });
  }

  async update(id: string, data: CreateMovementDto) {
    return this.prisma.movement.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.movement.delete({ where: { id } });
  }
}
