import { Controller, Post, Body, Redirect, Req } from '@nestjs/common';
import express from 'express';
import { AuthService } from './auth.service';
import { UserRole } from '../../common/enums/user-role.enum';

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: number;
      employeeNumber: string;
      name: string;
      role: UserRole;
    };
  }
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Redirect('/login')
  async register(@Body() body: { employeeNumber: string; name: string; password: string }) {
    const { employeeNumber, name, password } = body;
    await this.authService.register(employeeNumber, name, password);
    return;
  }

  @Post('login')
  @Redirect('/dashboard')
  async login(@Body() body: { employeeNumber: string; password: string }, @Req() req: express.Request) {
    const { employeeNumber, password } = body;
    const user = await this.authService.validateUser(employeeNumber, password);
    if (!user) return { url: '/login' };

    req.session.user = {
      id: user.id,
      employeeNumber: user.employeeNumber,
      name: user.name,
      role: user.role,
    };

    return { url: '/dashboard' };
  }

  @Post('logout')
  @Redirect('/login')
  async logout(@Req() req: express.Request) {
    req.session.destroy(() => null);
    return { url: '/login' };
  }
}
