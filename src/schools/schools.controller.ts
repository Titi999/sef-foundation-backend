import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Roles } from '../authentication/guards/roles/roles.decorator';
import { IPagination, IResponse } from '../shared/response.interface';
import { SchoolsService } from './schools.service';
import { School } from './school.entity';
import { CreateSchoolDto } from './schools.dto';
import { statusesTypes } from '../users/user.interface';

@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Roles(['super admin', 'admin'])
  @Get('all')
  async getAllSchool(): Promise<IResponse<School[]>> {
    return this.schoolsService.getAllSchools();
  }

  @Roles(['super admin', 'admin'])
  @Post('')
  async createSchool(
    @Body() createSchoolDto: CreateSchoolDto,
  ): Promise<IResponse<School>> {
    return this.schoolsService.createSchool(createSchoolDto);
  }

  @Roles(['super admin', 'admin'])
  @Get('')
  async getSchool(
    @Query('page') page: number,
    @Query('searchTerm') searchTerm: string,
    @Query('status') status: statusesTypes,
  ): Promise<IResponse<IPagination<School[]>>> {
    return this.schoolsService.getSchools(page, searchTerm, status);
  }

  @Roles(['super admin', 'admin'])
  @Patch(':id')
  async updateSchool(
    @Param('id') id: string,
    @Body() createSchoolDto: CreateSchoolDto,
  ): Promise<IResponse<School>> {
    return this.schoolsService.updateSchool(id, createSchoolDto);
  }

  @Roles(['super admin', 'admin'])
  @Delete(':id')
  async deleteSchool(@Param('id') id: string): Promise<IResponse<School>> {
    return this.schoolsService.deleteSchool(id);
  }
}
