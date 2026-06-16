import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { GetDashboardDto } from './dto/get-dashboard.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private service: AnalyticsService) {}

  @Get('week')
  getWeek(@Query() query: GetDashboardDto) {
    return this.service.getWeek(query);
  }

  @Get('top-movements')
  getTopMovements(@Query('limit') limit?: string) {
    return this.service.getTopMovements(limit ? parseInt(limit, 10) : 10);
  }

  @Get('top-workout-types')
  getTopWorkoutTypes(@Query('limit') limit?: string) {
    return this.service.getTopWorkoutTypes(limit ? parseInt(limit, 10) : 10);
  }

  @Get('oldest-movements')
  getOldestMovements(@Query('limit') limit?: string) {
    return this.service.getOldestMovements({
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  @Get('dashboard')
  getDashboard(@Query() query: GetDashboardDto) {
    return this.service.getDashboard(query);
  }
}
