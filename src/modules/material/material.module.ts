import { Module } from '@nestjs/common';
import { MaterialService } from './material.service';
import { MaterialController } from './material.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from 'src/common/entities/material.entity';
import { MaterialHistory } from 'src/common/entities/material-history.entity';
import { Production } from 'src/common/entities/production.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Material, MaterialHistory, Production])],
  controllers: [MaterialController],
  providers: [MaterialService],
})
export class MaterialModule {}
