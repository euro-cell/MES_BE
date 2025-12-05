import { Controller } from '@nestjs/common';
import { BinderService } from './binder.service';

@Controller('binder')
export class BinderController {
  constructor(private readonly binderService: BinderService) {}
}
