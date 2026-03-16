import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { MaterialService } from './material.service';
import { MaterialController } from './material.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from 'src/common/entities/material.entity';
import { MaterialHistory } from 'src/common/entities/material-history.entity';
import { Production } from 'src/common/entities/production.entity';
import { CoaModule } from './coa/coa.module';

@Module({
  imports: [
    RouterModule.register([
      { path: 'material/coa', module: CoaModule },
    ]),
    TypeOrmModule.forFeature([Material, MaterialHistory, Production]),
    CoaModule,
  ],
  controllers: [MaterialController],
  providers: [MaterialService],
  exports: [MaterialService],
})
export class MaterialModule {}
