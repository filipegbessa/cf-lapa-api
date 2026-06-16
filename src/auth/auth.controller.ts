import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post('login')
  login(
    @Body('email') email: string,
    @Body('password') password: string,
  ): Promise<{ access_token: string }> {
    return this.authService.login(email, password);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Passport redirects to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const profile = req.user as {
        googleId: string;
        email: string;
        name: string;
        picture?: string;
      };
      const frontendUrl = this.config.get<string>('FRONTEND_URL');

      if (!frontendUrl) {
        return res.status(500).json({
          error: 'FRONTEND_URL not configured',
        });
      }

      const result = await this.authService.loginWithGoogle(profile);

      if ('error' in result) {
        return res.redirect(`${frontendUrl}/admin/login?error=${result.error}`);
      }

      if (result.needsOnboarding) {
        return res.redirect(
          `${frontendUrl}/api/admin/auth/google-callback?token=${result.access_token}&onboarding=true`,
        );
      }

      return res.redirect(
        `${frontendUrl}/api/admin/auth/google-callback?token=${result.access_token}`,
      );
    } catch (error) {
      const err = error as Error;
      return res.status(500).json({
        error: 'Internal server error',
        message: err.message,
      });
    }
  }
}
