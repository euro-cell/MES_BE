import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrawingService } from './drawing.service';
import { DrawingController } from './drawing.controller';
import { Drawing } from '../../common/entities/drawing/drawing.entity';
import { DrawingVersion } from '../../common/entities/drawing/drawing-version.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Drawing, DrawingVersion])],
  controllers: [DrawingController],
  providers: [DrawingService],
  exports: [DrawingService],
})
export class DrawingModule {}
