import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './student.entity';
import { In, IsNull, Repository } from 'typeorm';
import { AddStudentDto } from './student.dto';
import { IPagination, IResponse } from '../shared/response.interface';
import { UsersService } from '../users/users.service';
import { statuses, statusesTypes, userRoles } from '../users/user.interface';
import { SchoolsService } from '../schools/schools.service';
import { User } from '../users/entities/user.entity';

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

    queryBuilder.innerJoinAndSelect('student.school', 'school');
    queryBuilder.leftJoinAndSelect('student.user', 'user');

    if (searchTerm) {
      queryBuilder.where('LOWER(student.name) LIKE LOWER(:searchTerm)', {
        searchTerm: `%${searchTerm}%`,
      });
      queryBuilder.orWhere('LOWER(school.name) LIKE LOWER(:searchTerm)', {
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
    if (addStudentDto.email) {
      const response = await this.userService.inviteUser({
        name: addStudentDto.name,
        email: addStudentDto.email,
        role: userRoles[2],
      });
      student.user = response.data;
    }
    await this.setStudent(student, addStudentDto);
    await this.studentsRepository.save(student);

    return {
      message: `Student added successfully${addStudentDto.email ? ' and invitation sent' : ''}`,
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
    if (!student.user && addStudentDto.email) {
      const response = await this.userService.inviteUser({
        name: addStudentDto.name,
        email: addStudentDto.email,
        role: userRoles[2],
      });
      student.user = response.data;
    }
    await this.setStudent(student, addStudentDto);
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
    await this.setStudent(student, addStudentDto);
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
    await this.setStudent(student, addStudentDto);
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
    const student = await this.studentsRepository.findOneBy({
      user: {
        id: user.id,
      },
    });

    return {
      message: 'Student loaded successfully',
      data: student,
    };
  }

  public async deleteStudent(id: string) {
    const student = await this.studentsRepository.findOneByOrFail({ id });
    const userId = await student.user?.id;
    if (userId) {
      const user = await this.userService.findOne(userId);
      await this.userService.deactivate(user);
    }
    await this.studentsRepository.remove(student);

    return {
      message: 'Student deleted successfully',
      data: student,
    };
  }

  public async deactivateStudent(id: string) {
    const student = await this.studentsRepository.findOneByOrFail({ id });
    student.status = statuses[1];
    student.deactivated_at = new Date();
    const userId = await student.user?.id;
    if (userId) {
      const user = await this.userService.findOne(userId);
      await this.userService.deactivate(user);
    }
    await this.studentsRepository.save(student);

    return {
      message: 'Student deactivated successfully',
      data: student,
    };
  }

  public async activateStudent(id: string) {
    const student = await this.studentsRepository.findOneByOrFail({ id });
    student.status = statuses[0];

    await this.studentsRepository.save(student);

    return {
      message: 'Student deactivated successfully',
      data: student,
    };
  }

  private async setStudent(student: Student, addStudentDto: AddStudentDto) {
    student.name = addStudentDto.name;
    student.level = addStudentDto.level;
    student.description = addStudentDto.description;
    student.parent = addStudentDto.parent;
    student.phone = addStudentDto.phone;
    student.greatGrandparent = addStudentDto.greatGrandparent;
    student.grandParent = addStudentDto.grandParent;
    student.school = await this.schoolsService.findSchoolById(
      addStudentDto.school,
    );
    student.parentPhone = addStudentDto.parentPhone;
    student.boardingHouse = addStudentDto.boardingHouse;
  }

  public async getStudentById(id: string) {
    return this.studentsRepository.findOneByOrFail({ id });
  }

  public async getAllStudents(user: string): Promise<IResponse<Student[]>> {
    const userCondition = user === 'yes' ? { user: IsNull() } : {};

    const students = await this.studentsRepository.findBy({
      status: statuses[0],
      ...userCondition,
    });

    return {
      message: 'You have successfully loaded students',
      data: students,
    };
  }

  public async getAllStudentsCount(year?: number): Promise<number> {
    const queryBuilder = this.studentsRepository.createQueryBuilder('student');

    if (year) {
      queryBuilder.andWhere('EXTRACT(YEAR FROM student.created_at) = :year', {
        year,
      });
    }

    return queryBuilder.getCount();
  }

  public async findStudentByUserId(id: string) {
    const user = await this.userService.findOneOrFail(id);
    return await this.studentsRepository.findOneByOrFail({
      user: {
        id: user.id,
      },
    });
  }

  public async beneficiaryInfoExists(id: string): Promise<IResponse<boolean>> {
    const user = await this.userService.findOneOrFail(id);
    const student = await this.studentsRepository.findOneBy({
      user: {
        id: user.id,
      },
    });

    return {
      message: 'Check completed successfully',
      data: !!student,
    };
  }

  public async findUser(studentId: string) {
    const student = await this.studentsRepository.findOne({
      where: {
        id: studentId,
      },
      relations: ['user'],
    });

    return student.user;
  }

  public async findStudentById(id: string) {
    return await this.studentsRepository.findOneBy({ id });
  }

  public async findStudentsByCodes(codes: string[]): Promise<Student[]> {
    return await this.studentsRepository.find({
      where: { code: In(codes), status: statuses[0] },
      relations: ['user'],
    });
  }
}
