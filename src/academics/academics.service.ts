import { ConflictException, Injectable } from '@nestjs/common';
import { AcademicsDto } from './academics.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Academic } from './academics.entity';
import { Repository } from 'typeorm';
import { StudentsService } from '../students/students.service';
import { IPagination, IResponse } from '../shared/response.interface';

@Injectable()
export class AcademicsService {
  constructor(
    @InjectRepository(Academic)
    private readonly academicRepository: Repository<Academic>,
    private readonly studentsService: StudentsService,
  ) {}

  public async createAcademic(
    academicsDto: AcademicsDto,
    id?: string,
  ): Promise<IResponse<Academic>> {
    let findExistingAcademic: Academic;
    if (id) {
      findExistingAcademic = await this.academicRepository.findOneBy({
        year: academicsDto.year,
        term: academicsDto.term,
        student: {
          user: {
            id: id,
          },
        },
      });
    } else {
      findExistingAcademic = await this.academicRepository.findOneBy({
        year: academicsDto.year,
        term: academicsDto.term,
        student: {
          id: academicsDto.studentId,
        },
      });
    }

    if (findExistingAcademic) {
      throw new ConflictException({
        message: 'Academic results already exists with same year and term',
      });
    }
    const academic = new Academic();
    await this.setAcademic(academic, academicsDto, id);

    await this.academicRepository.save(academic);

    return {
      message: 'Academic record saved successfully',
      data: academic,
    };
  }

  async getAcademics(
    page: number,
    searchTerm: string,
    id?: string,
  ): Promise<IResponse<IPagination<Academic[]>>> {
    const skip = (page - 1) * 10;
    const queryBuilder = this.academicRepository
      .createQueryBuilder('academic')
      .innerJoinAndSelect('academic.student', 'student')
      .innerJoinAndSelect('student.school', 'school');

    if (id) {
      queryBuilder.where('user.id = :id', {
        id,
      });
    }

    if (searchTerm) {
      queryBuilder.where('LOWER(student.name) LIKE LOWER(:searchTerm)', {
        searchTerm: `%${searchTerm}%`,
      });
      queryBuilder.orWhere('LOWER(school.name) LIKE LOWER(:searchTerm)', {
        searchTerm: `%${searchTerm}%`,
      });
    }

    const [academics, total] = await queryBuilder
      .skip(skip)
      .take(10)
      .getManyAndCount();

    return {
      message: 'Academic records loaded successfully',
      data: {
        total,
        currentPage: page,
        totalPages: Math.ceil(total / 10),
        items: academics,
      },
    };
  }

  public async updateAcademic(
    id: string,
    academicsDto: AcademicsDto,
    userId?: string,
  ): Promise<IResponse<Academic>> {
    let academic: Academic;
    if (userId) {
      academic = await this.academicRepository.findOneByOrFail({
        id,
        student: {
          user: {
            id: userId,
          },
        },
      });
    } else {
      academic = await this.academicRepository.findOneByOrFail({
        id,
      });
    }
    await this.setAcademic(academic, academicsDto, userId);
    await this.academicRepository.save(academic);
    return {
      message: 'Academic record updated successfully',
      data: academic,
    };
  }

  public async deleteAcademic(
    academicId: string,
    userId?: string,
  ): Promise<IResponse<Academic>> {
    let academic: Academic;
    if (userId) {
      academic = await this.academicRepository.findOneByOrFail({
        id: academicId,
        student: {
          user: {
            id: userId,
          },
        },
      });
    } else {
      academic = await this.academicRepository.findOneByOrFail({
        id: academicId,
      });
    }

    await this.academicRepository.remove(academic);

    return {
      message: 'Academic Deleted Successfully',
      data: academic,
    };
  }

  private async setAcademic(
    academic: Academic,
    academicsDto: AcademicsDto,
    id?: string,
  ) {
    if (id) {
      academic.student = await this.studentsService.findStudentByUserId(id);
    } else {
      academic.student = await this.studentsService.findStudentById(
        academicsDto.studentId,
      );
    }
    academic.year = academicsDto.year;
    academic.term = academicsDto.term;
    academic.remarks = academicsDto.remarks;
    academic.averageScore = academicsDto.averageScore;
  }
}
