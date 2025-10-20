import { Controller, Post, Body, Redirect, Req } from '@nestjs/common';
import express from 'express';
import { AuthService } from './auth.service';

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: number;
      username: string;
      role: string;
    };
  }
}

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Redirect('/login')
  async register(@Body() body: { username: string; password: string }) {
    await this.authService.register(body.username, body.password);
    return;
  }

  @Post('login')
  @Redirect('/dashboard')
  async login(
    @Body() body: { username: string; password: string },
    @Req() req: express.Request,
  ) {
    const user = await this.authService.validateUser(
      body.username,
      body.password,
    );
    if (!user) return { url: '/login' };

    req.session.user = {
      id: user.id,
      username: user.username,
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
