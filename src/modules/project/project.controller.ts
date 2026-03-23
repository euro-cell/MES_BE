import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto } from 'src/common/dtos/project.dto';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  async getProjects() {
    return await this.projectService.findAll();
  }

  @Post()
  async createProject(@Body() dto: CreateProjectDto) {
    await this.projectService.create(dto);
  }

  @Patch(':id')
  async updateProject(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProjectDto) {
    return this.projectService.update(id, dto);
  }

  @Delete(':id')
  async deleteProject(@Param('id', ParseIntPipe) id: number) {
    return this.projectService.remove(id);
  }

  @Get('specification')
  async getSpecificationSummary() {
    return await this.projectService.getSpecificationSummary();
  }
}
