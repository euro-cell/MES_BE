import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserDto } from 'src/common/dtos/user.dto';
import { User } from 'src/common/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly UserRepository: Repository<User>,
  ) {}

  async findAll() {
    return await this.UserRepository.find();
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    await this.UserRepository.update(id, dto);
    return await this.UserRepository.findOneBy({ id });
  }
}
