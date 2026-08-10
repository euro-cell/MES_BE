import { Module } from '@nestjs/common';
import { UniverCliService } from './univer-cli.service';

@Module({
  providers: [UniverCliService],
  exports: [UniverCliService],
})
export class UniverCliModule {}
