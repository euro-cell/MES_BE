import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../common/entities/shared/customer.entity';
import { CreateCustomerDto, UpdateCustomerDto } from '../../common/dtos/customer/customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async findAll() {
    return this.customerRepository.find({ order: { id: 'ASC' } });
  }

  async create(dto: CreateCustomerDto) {
    const existing = await this.customerRepository.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException(`이미 존재하는 고객사명입니다: ${dto.name}`);

    const customer = this.customerRepository.create(dto);
    return this.customerRepository.save(customer);
  }

  async update(id: number, dto: UpdateCustomerDto) {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) throw new NotFoundException(`ID ${id}번 고객사를 찾을 수 없습니다.`);

    if (dto.name && dto.name !== customer.name) {
      const existing = await this.customerRepository.findOne({ where: { name: dto.name } });
      if (existing) throw new ConflictException(`이미 존재하는 고객사명입니다: ${dto.name}`);
    }

    Object.assign(customer, dto);
    return this.customerRepository.save(customer);
  }

  async remove(id: number) {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) throw new NotFoundException(`ID ${id}번 고객사를 찾을 수 없습니다.`);

    await this.customerRepository.softDelete(id);
    return { success: true };
  }
}
