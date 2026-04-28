import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../common/entities/shared/user.entity';
import { ChangePasswordDto, RegisterDto } from 'src/common/dtos/shared/user.dto';
import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOne({ where: { employeeNumber: dto.employeeNumber } });
    if (existing) throw new ConflictException('이미 등록된 사번입니다.');
    const hashed = await bcrypt.hash(dto.password, 10);
    return await this.userRepository.save({ ...dto, password: hashed });
  }

  async validateUser(employeeNumber: string, password: string) {
    const user = await this.userRepository.findOne({ where: { employeeNumber } });
    if (!user) throw new NotFoundException('존재하지 않는 사번입니다.');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

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

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const isMatch = user && (await bcrypt.compare(dto.currentPassword, user.password));
    if (!isMatch) throw new UnauthorizedException('현재 비밀번호가 올바르지 않습니다.');
    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.update(userId, { password: hashed });
    return { message: '비밀번호가 변경되었습니다.' };
  }

  async logout(req: Request, res: Response) {
    await new Promise<void>((resolve) => req.logout?.(() => resolve()));
    await new Promise<void>((resolve) => req.session?.destroy(() => resolve()));
    res.clearCookie('connect.sid');
    return { message: '로그아웃 완료' };
  }
}
