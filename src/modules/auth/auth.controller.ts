import { Controller, Post, Get, Patch, UseGuards, Req, Body, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ApiBody } from '@nestjs/swagger';
import { ChangePasswordDto, LoginDto, RegisterDto } from 'src/common/dtos/shared/user.dto';
import { SessionAuthGuard } from 'src/common/guards/session-auth.guard';
import { GetUserId } from 'src/common/decorators/user.decorator';
// import { memoryStore } from 'src/common/configs/session.config';
// import { promisify } from 'util';
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
      const expiresAt = req.session?.cookie?.expires ? new Date(req.session.cookie.expires).toISOString() : null;
      const expiresIn = req.session?.cookie?.originalMaxAge ? Math.floor(req.session.cookie.originalMaxAge / 1000) : null;
      return { authenticated: true, user: req.user, expiresAt, expiresIn };
    }
    return { authenticated: false };
  }

  @Patch('me/password')
  @UseGuards(SessionAuthGuard)
  @ApiBody({ type: ChangePasswordDto })
  async changePassword(@GetUserId() userId: number, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(userId, dto);
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return await this.authService.logout(req, res);
  }

  // @Get('sessions')
  // async getAllSessions() {
  //   const allSessions = promisify(memoryStore.all).bind(memoryStore);
  //   const sessions = await allSessions();
  //   console.log('🧠 현재 세션 목록:', sessions);
  //   return sessions;
  // }
}
