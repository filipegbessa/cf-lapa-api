import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetDashboardDto } from './dto/get-dashboard.dto';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getWeek({ startDate, endDate }: GetDashboardDto) {
    let monday: Date;
    let nextMonday: Date;

    if (startDate && endDate) {
      monday = new Date(startDate);
      nextMonday = new Date(endDate);
      monday.setUTCHours(0, 0, 0, 0);
      nextMonday.setUTCHours(23, 59, 59, 999);
    } else {
      const today = new Date();
      const dayOfWeek = today.getUTCDay();
      monday = new Date(today);
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      monday.setUTCDate(today.getUTCDate() + diffToMonday);
      monday.setUTCHours(0, 0, 0, 0);
      nextMonday = new Date(monday);
      nextMonday.setUTCDate(monday.getUTCDate() + 7);
    }
    const workouts = await this.prisma.workout.findMany({
      where: {
        date: {
          gte: monday,
          lt: nextMonday,
        },
      },
      include: {
        warmup: {
          include: { movement: true },
        },
        skill: {
          include: { movement: true },
        },
        wod: {
          include: { movement: true },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    const workoutsMap = new Map(
      workouts.map((workout) => [
        workout.date.toISOString().split('T')[0],
        workout,
      ]),
    );

    const week: Array<{
      date: string;
      workoutId?: string;
    }> = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(monday);
      currentDate.setUTCDate(monday.getUTCDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      const workout = workoutsMap.get(dateStr);

      week.push({
        date: dateStr,
        workoutId: workout?.id,
      });
    }

    return week;
  }

  async getTopMovements(limit: number = 10) {
    const blocks = await this.prisma.block.groupBy({
      by: ['movementId'],
      where: { movementId: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    const movementIds = blocks
      .map((b) => b.movementId)
      .filter((id) => id !== null);

    if (movementIds.length === 0) {
      return [];
    }

    const movements = await this.prisma.movement.findMany({
      where: { id: { in: movementIds } },
    });

    return blocks.map((block) => {
      const movement = movements.find((m) => m.id === block.movementId);
      return {
        id: block.movementId,
        name: movement?.name,
        abbreviation: movement?.abbreviation,
        count: block._count.id,
      };
    });
  }

  async getTopWorkoutTypes(limit: number = 10) {
    const result = await this.prisma.$queryRaw<
      Array<{ type: string; count: number }>
    >`
      SELECT type, COUNT(*)::int as count
      FROM (
        SELECT "warmupType" as type FROM "Workout" WHERE "warmupType" IS NOT NULL
        UNION ALL
        SELECT "skillType" as type FROM "Workout" WHERE "skillType" IS NOT NULL
        UNION ALL
        SELECT "wodType" as type FROM "Workout" WHERE "wodType" IS NOT NULL
      ) types
      GROUP BY type
      ORDER BY count DESC
      LIMIT ${limit}
    `;

    return result.map((row) => ({
      type: row.type,
      count: row.count,
    }));
  }

  async getOldestMovements({ limit = 10 }: { limit: number }) {
    const result = await this.prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        abbreviation: string | null;
        last_used: Date | null;
      }>
    >`
      SELECT m.id, m.name, m.abbreviation, MAX(w.date) as last_used
      FROM "Movement" m

      INNER JOIN "Block" b ON b."movementId" = m.id
      INNER JOIN "Workout" w ON (w.id = b."warmupOfId" OR w.id = b."skillOfId" OR w.id = b."wodOfId")

      WHERE w.date <= CURRENT_DATE

      GROUP BY m.id, m.name, m.abbreviation
      ORDER BY last_used ASC NULLS FIRST
      LIMIT ${limit}
    `;

    return result.map((row) => ({
      id: row.id,
      name: row.name,
      abbreviation: row.abbreviation,
      lastUsed: row.last_used,
    }));
  }

  async getDashboard(props: GetDashboardDto) {
    const [week, topMovements, topWorkoutTypes, oldestMovements] =
      await Promise.all([
        this.getWeek(props),
        this.getTopMovements(10),
        this.getTopWorkoutTypes(10),
        this.getOldestMovements({ limit: 10 }),
      ]);

    return {
      week,
      topMovements,
      topWorkoutTypes,
      oldestMovements,
    };
  }
}
