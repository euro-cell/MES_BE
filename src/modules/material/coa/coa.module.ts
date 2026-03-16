import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialCoa } from 'src/common/entities/material-coa.entity';
import { CoaService } from './coa.service';
import { CoaController } from './coa.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MaterialCoa])],
  controllers: [CoaController],
  providers: [CoaService],
})
export class CoaModule {}
