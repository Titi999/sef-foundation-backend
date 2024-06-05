import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './student.entity';
import { Repository } from 'typeorm';
import { AddStudentDto } from './student.dto';
import { IPagination, IResponse } from '../shared/response.interface';
import { UsersService } from '../users/users.service';
import { statusesTypes, userRoles } from '../users/user.interface';
import { SchoolsService } from '../schools/schools.service';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
    private readonly userService: UsersService,
    private readonly schoolsService: SchoolsService,
  ) {}

  async getStudents(
    page: number = 1,
    searchTerm: string = '',
    status: statusesTypes | '',
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

    if (status) {
      queryBuilder.where('LOWER(student.status) = LOWER(:status)', {
        status,
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

  async editStudent(
    id: string,
    addStudentDto: AddStudentDto,
  ): Promise<IResponse<Student>> {
    const student = await this.studentsRepository.findOneBy({
      id,
    });
    this.setStudent(student, addStudentDto);
    await this.studentsRepository.save(student);

    return {
      message: 'Student information edited successfully',
      data: student,
    };
  }

  async editStudentByBeneficiary(
    id: string,
    addStudentDto: AddStudentDto,
  ): Promise<IResponse<Student>> {
    const user = await this.userService.findUserByRole(id, userRoles[2]);
    const student = await this.studentsRepository.findOneByOrFail({
      user: {
        id: user.id,
      },
    });
    this.setStudent(student, addStudentDto);
    await this.studentsRepository.save(student);

    return {
      message: 'Student edited successfully',
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

  public async getStudent(id: string): Promise<IResponse<Student>> {
    const student = await this.studentsRepository.findOneByOrFail({
      id,
    });

    return {
      message: 'Student loaded successfully',
      data: student,
    };
  }

  public async getStudentByBeneficiary(
    id: string,
  ): Promise<IResponse<Student>> {
    const user = await this.userService.findOne(id);
    const student = await this.studentsRepository.findOneByOrFail({
      user: {
        id: user.id,
      },
    });

    return {
      message: 'Student loaded successfully',
      data: student,
    };
  }

  private async setStudent(student: Student, addStudentDto: AddStudentDto) {
    student.name = addStudentDto.name;
    student.level = addStudentDto.level;
    student.description = addStudentDto.description;
    student.parent = addStudentDto.parent;
    student.phone = addStudentDto.phone;
    student.school = await this.schoolsService.findSchoolById(
      addStudentDto.school,
    );
    student.parentPhone = addStudentDto.parentPhone;
  }

  public async getStudentById(id: string) {
    return this.studentsRepository.findOneByOrFail({ id });
  }

  public async getAllStudents(): Promise<IResponse<Student[]>> {
    const students = await this.studentsRepository.find();

    return {
      message: 'You have successfully loaded students',
      data: students,
    };
  }

  public async getAllStudentsCount(): Promise<number> {
    const queryBuilder = this.studentsRepository.createQueryBuilder('student');

    return queryBuilder.getCount();
  }
}
