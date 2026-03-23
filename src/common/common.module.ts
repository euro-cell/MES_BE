import { Global, Module } from '@nestjs/common';
import { ExcelService } from './services/excel.service';
import { MenuSeedService } from './services/menu-seed.service';
import { RustfsService } from './services/rustfs.service';

@Global()
@Module({
  providers: [ExcelService, MenuSeedService, RustfsService],
  exports: [ExcelService, RustfsService],
})
export class CommonModule {}
