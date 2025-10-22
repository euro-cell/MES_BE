import { Controller, Post, Get, UseGuards, Req, Body, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ApiBody } from '@nestjs/swagger';
import { LoginDto, RegisterDto } from 'src/common/dtos/user.dto';
import { memoryStore } from 'src/common/configs/session.config';
import { promisify } from 'util';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiBody({ type: RegisterDto })
  async register(@Body() dto: RegisterDto) {
    await this.authService.register(dto);
    return { message: '회원 등록 완료' };
  }

  @Post('login')
  @ApiBody({ type: LoginDto })
  @UseGuards(AuthGuard('local'))
  async login(@Req() req: any) {
    return this.authService.login(req, req.user);
  }

  @Get('status')
  async status(@Req() req: Request) {
    if (req.isAuthenticated && req.isAuthenticated()) {
      return { authenticated: true, user: req.user };
    }
    return { authenticated: false };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return await this.authService.logout(req, res);
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
