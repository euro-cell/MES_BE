import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Redirect,
} from '@nestjs/common';
import { ProjectService } from './project.service';

@Controller('api/project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  async getProjects() {
    return await this.projectService.findAll();
  }

  @Post('create')
  @Redirect('/projects')
  async createProject(@Body() body) {
    await this.projectService.create(body);
  }

  @Delete(':id')
  async deleteProject(@Param('id', ParseIntPipe) id: number) {
    return this.projectService.remove(id);
  }
}
