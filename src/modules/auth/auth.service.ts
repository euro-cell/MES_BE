import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../common/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async register(employeeNumber: string, name: string, password: string) {
    const existing = await this.userRepo.findOne({ where: { employeeNumber } });
    if (existing) throw new ConflictException('이미 등록된 사번입니다.');

    const user = this.userRepo.create({
      employeeNumber,
      name,
      password,
    });
    return this.userRepo.save(user);
  }

  async validateUser(employeeNumber: string, password: string) {
    const user = await this.userRepo.findOne({ where: { employeeNumber } });
    if (!user) throw new UnauthorizedException('존재하지 않는 사번입니다.');

    // 패스워드 임시 구현
    if (user.password !== password) return null;

    const { password: _pw, ...result } = user;
    return result;
  }

  async findById(id: number) {
    return this.userRepo.findOne({ where: { id } });
  }
}
