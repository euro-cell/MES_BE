import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterDto, UpdateUserDto } from 'src/common/dtos/shared/user.dto';
import { User } from 'src/common/entities/shared/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly UserRepository: Repository<User>,
  ) {}

  async createUser(dto: RegisterDto) {
    const exist = await this.UserRepository.findOne({ where: { employeeNumber: dto.employeeNumber } });
    if (exist) throw new ConflictException('이미 존재하는 사번입니다.');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.UserRepository.create({ ...dto, password: hashed, isActive: true });
    return await this.UserRepository.save(user);
  }

  async findAll() {
    return await this.UserRepository.find({ order: { id: 'ASC' } });
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    const data: UpdateUserDto = { ...dto };
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    await this.UserRepository.update(id, data);
    return await this.UserRepository.findOneBy({ id });
  }

  async deleteUser(id: number) {
    const user = await this.UserRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    await this.UserRepository.softDelete(user.id);
  }
}
