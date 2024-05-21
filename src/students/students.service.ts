import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './student.entity';
import { Repository } from 'typeorm';
import { AddStudentDto } from './student.dto';
import { IPagination, IResponse } from '../shared/response.interface';
import { UsersService } from '../users/users.service';
import { userRoles } from '../users/user.interface';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
    private readonly userService: UsersService,
  ) {}

  async getStudents(
    page: number = 1,
    searchTerm: string = '',
  ): Promise<IResponse<IPagination<Student[]>>> {
    const skip = (page - 1) * 10;
    const queryBuilder = this.studentsRepository.createQueryBuilder('student');

    if (searchTerm) {
      queryBuilder.where('LOWER(student.name) LIKE LOWER(:searchTerm)', {
        searchTerm: `%${searchTerm}%`,
      });
      queryBuilder.orWhere('LOWER(student.school) LIKE LOWER(:searchTerm)', {
        searchTerm: `%${searchTerm}%`,
      });
    }

    const [students, total] = await queryBuilder
      .skip(skip)
      .take(10)
      .getManyAndCount();

    return {
      message: 'Students loaded successfully',
      data: {
        total,
        currentPage: page,
        totalPages: Math.ceil(total / 10),
        items: students,
      },
    };
  }

  async addStudent(addStudentDto: AddStudentDto): Promise<IResponse<Student>> {
    const student = new Student();
    this.setStudent(student, addStudentDto);
    await this.studentsRepository.save(student);

    return {
      message: 'Student added successfully',
      data: student,
    };
  }

  async addStudentByBeneficiary(
    id: string,
    addStudentDto: AddStudentDto,
  ): Promise<IResponse<Student>> {
    const user = await this.userService.findUserByRole(id, userRoles[2]);
    const student = new Student();
    this.setStudent(student, addStudentDto);
    student.user = user;
    await this.studentsRepository.save(student);

    return {
      message: 'Student added successfully',
      data: student,
    };
  }

  private setStudent(student: Student, addStudentDto: AddStudentDto) {
    student.name = addStudentDto.name;
    student.level = addStudentDto.level;
    student.description = addStudentDto.description;
    student.parent = addStudentDto.parent;
    student.phone = addStudentDto.phone;
    student.school = addStudentDto.school;
  }
}
