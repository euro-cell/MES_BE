import { Controller } from '@nestjs/common';
// import { Body, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
// import { SpecificationService } from './specification.service';
// import { CreateBatteryDesignDto } from 'src/common/dtos/specification/specification.dto';

@Controller('specification')
export class SpecificationController {
  // constructor(private readonly specificationService: SpecificationService) {}
  // @Post(':projectId')
  // async createSpecification(@Param('projectId', ParseIntPipe) projectId: number, @Body() dto: CreateBatteryDesignDto) {
  //   return this.specificationService.createSpecification(projectId, dto);
  // }
  // @Get(':projectId')
  // async findSpecification(@Param('projectId', ParseIntPipe) projectId: number) {
  //   return this.specificationService.findSpecification(projectId);
  // }
  // @Delete(':projectId')
  // async softDeleteSpecification(@Param('projectId', ParseIntPipe) projectId: number) {
  //   return this.specificationService.softDeleteSpecification(projectId);
  // }
}
