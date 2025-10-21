import { Controller, Post, Get, UseGuards, Req, Body, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ApiBody } from '@nestjs/swagger';
import { LoginDto } from 'src/common/dtos/login.dto';
import { memoryStore } from 'src/common/configs/session.config';
import { promisify } from 'util';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { employeeNumber: string; name: string; password: string }) {
    const { employeeNumber, name, password } = body;
    await this.authService.register(employeeNumber, name, password);
    return { message: '회원 등록 완료' };
  }

  @Post('login')
  @ApiBody({ type: LoginDto })
  @UseGuards(AuthGuard('local'))
  async login(@Req() req) {
    return new Promise((resolve, reject) => {
      req.login(req.user, (err) => {
        if (err) return reject(err);
        resolve({ message: '로그인 성공', user: req.user });
      });
    });
  }

  @Get('status')
  status(@Req() req: Request) {
    if (req.isAuthenticated && req.isAuthenticated()) {
      return { authenticated: true, user: req.user };
    }
    return { authenticated: false };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await new Promise<void>((resolve) => req.logout?.(() => resolve()));
    await new Promise<void>((resolve) => req.session?.destroy(() => resolve()));
    res.clearCookie('connect.sid');
    return { message: '로그아웃 완료' };
  }

  //Todo: 세션 확인용, 추후 삭제 예정
  @Get('sessions')
  async getAllSessions() {
    const allSessions = promisify(memoryStore.all).bind(memoryStore);
    const sessions = await allSessions();
    console.log('🧠 현재 세션 목록:', sessions);
    return sessions;
  }
}
