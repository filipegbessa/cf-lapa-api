import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findByEmail(email);

    if (
      !user ||
      !user.passwordHash ||
      !(await bcrypt.compare(password, user.passwordHash))
    ) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('blocked');
    }
    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException('inactive');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return { access_token: this.jwt.sign(payload) };
  }

  async loginWithGoogle(profile: {
    googleId: string;
    email: string;
    name: string;
    picture?: string;
  }): Promise<
    | { access_token: string; needsOnboarding?: boolean }
    | { error: 'unauthorized' | 'inactive' }
  > {
    let user = await this.usersService.findByGoogleId(profile.googleId);

    if (!user) {
      const byEmail = await this.usersService.findByEmail(profile.email);
      if (!byEmail) {
        return { error: 'unauthorized' };
      }
      user = await this.usersService.linkGoogleId(byEmail.id, profile.googleId);
    }

    if (user.status === UserStatus.INACTIVE) {
      return { error: 'inactive' };
    }

    if (user.status === UserStatus.BLOCKED && !user.onboardingCompleted) {
      const token = this.jwt.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      });
      return { access_token: token, needsOnboarding: true };
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return { access_token: this.jwt.sign(payload) };
  }
}
