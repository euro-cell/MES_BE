import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrawingService } from './drawing.service';
import { DrawingController } from './drawing.controller';
import { Drawing } from 'src/common/entities/drawing.entity';
import { DrawingVersion } from 'src/common/entities/drawing-version.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Drawing, DrawingVersion])],
  controllers: [DrawingController],
  providers: [DrawingService],
  exports: [DrawingService],
})
export class DrawingModule {}
