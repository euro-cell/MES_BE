import { Module } from '@nestjs/common';
import { BinderService } from './binder.service';
import { BinderController } from './binder.controller';

@Module({
  imports: [],
  controllers: [BinderController],
  providers: [BinderService],
})
export class BinderModule {}
