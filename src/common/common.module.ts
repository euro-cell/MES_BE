import { Global, Module } from '@nestjs/common';
import { ExcelService } from './services/excel.service';
import { MenuSeedService } from './services/menu-seed.service';

@Global()
@Module({
  providers: [ExcelService, MenuSeedService],
  exports: [ExcelService],
})
export class CommonModule {}
