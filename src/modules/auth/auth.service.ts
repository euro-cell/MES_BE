import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../common/entities/user.entity';
import { RegisterDto } from 'src/common/dtos/user.dto';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOne({ where: { employeeNumber: dto.employeeNumber } });
    if (existing) throw new ConflictException('이미 등록된 사번입니다.');
    return await this.userRepository.save(dto);
  }

  async validateUser(employeeNumber: string, password: string) {
    const user = await this.userRepository.findOne({ where: { employeeNumber } });
    if (!user) throw new UnauthorizedException('존재하지 않는 사번입니다.');

    // 패스워드 임시 구현
    if (user.password !== password) return null;

    const { password: _pw, ...result } = user;
    return result;
  }

  async findById(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }

  async login(req: any, user: any) {
    return new Promise((resolve, reject) => {
      req.login(user, (err: any) => {
        if (err) return reject(err);
        resolve({ message: '로그인 성공', user });
      });
    });
  }

  async logout(req: Request, res: Response) {
    await new Promise<void>((resolve) => req.logout?.(() => resolve()));
    await new Promise<void>((resolve) => req.session?.destroy(() => resolve()));
    res.clearCookie('connect.sid');
    return { message: '로그아웃 완료' };
  }
}
