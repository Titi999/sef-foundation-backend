import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { IPagination, IResponse } from '../shared/response.interface';
import { StudentsService } from './students.service';
import { AddStudentDto } from './student.dto';
import { Student } from './student.entity';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles/roles.guard';
import { Roles } from '../authentication/guards/roles/roles.decorator';
import { statusesTypes } from '../users/user.interface';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @UsePipes(new ValidationPipe())
  @Roles(['super admin', 'admin'])
  @Get('get')
  async getStudents(
    @Query('page') page: number,
    @Query('searchTerm') searchTerm: string,
    @Query('status') status: statusesTypes | '',
  ): Promise<IResponse<IPagination<Student[]>>> {
    return this.studentsService.getStudents(page, searchTerm, status);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin'])
  @Get('all')
  async getAllStudents(
    @Query('user') user: string = 'no',
  ): Promise<IResponse<Student[]>> {
    return this.studentsService.getAllStudents(user);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin', 'admin'])
  @Get(':id')
  async getStudent(@Param('id') id: string): Promise<IResponse<Student>> {
    return this.studentsService.getStudent(id);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['beneficiary'])
  @Get('beneficiary/:id')
  async getStudentByBeneficiary(
    @Param('id') id: string,
  ): Promise<IResponse<Student>> {
    return this.studentsService.getStudentByBeneficiary(id);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin', 'admin'])
  @Post('add-student')
  async addStudent(
    @Body() addStudentDto: AddStudentDto,
  ): Promise<IResponse<Student>> {
    return this.studentsService.addStudent(addStudentDto);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['beneficiary'])
  @Post('add-student/:id')
  async addStudentByBeneficiary(
    @Param('id') id: string,
    @Body() addStudentDto: AddStudentDto,
  ): Promise<IResponse<Student>> {
    return this.studentsService.addStudentByBeneficiary(id, addStudentDto);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin', 'admin'])
  @Patch('edit-student/:id')
  async editStudent(
    @Param('id') id: string,
    @Body() addStudentDto: AddStudentDto,
  ): Promise<IResponse<Student>> {
    return this.studentsService.editStudent(id, addStudentDto);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['beneficiary'])
  @Patch('beneficiary/edit-student/:id')
  async editStudentByBeneficiary(
    @Param('id') id: string,
    @Body() addStudentDto: AddStudentDto,
  ): Promise<IResponse<Student>> {
    return this.studentsService.editStudentByBeneficiary(id, addStudentDto);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin'])
  @Delete(':id')
  async deleteStudent(@Param('id') id: string): Promise<IResponse<Student>> {
    return this.studentsService.deleteStudent(id);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin'])
  @Get('deactivate/:id')
  async deactivateStudent(
    @Param('id') id: string,
  ): Promise<IResponse<Student>> {
    return this.studentsService.deactivateStudent(id);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin'])
  @Get('activate/:id')
  async activateStudent(@Param('id') id: string): Promise<IResponse<Student>> {
    return this.studentsService.activateStudent(id);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['beneficiary'])
  @Get('beneficiary-exists/:id')
  async beneficiaryInfoExists(
    @Param('id') id: string,
  ): Promise<IResponse<boolean>> {
    return this.studentsService.beneficiaryInfoExists(id);
  }
}
