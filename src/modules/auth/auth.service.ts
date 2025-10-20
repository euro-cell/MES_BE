import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../common/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async register(username: string, password: string) {
    const user = this.userRepo.create({ username, password });
    return this.userRepo.save(user);
  }

  async validateUser(username: string, password: string) {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) return null;

    // 패스워드 임시 구현
    if (user.password !== password) return null;

    return user;
  }
}
