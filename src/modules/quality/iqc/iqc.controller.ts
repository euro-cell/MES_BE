import { Controller } from '@nestjs/common';
import { IqcService } from './iqc.service';

@Controller('iqc')
export class IqcController {
  constructor(private readonly iqcService: IqcService) {}
}
