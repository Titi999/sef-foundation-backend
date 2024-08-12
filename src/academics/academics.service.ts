import { ConflictException, Injectable } from '@nestjs/common';
import { AcademicsDto } from './academics.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Academic } from './academics.entity';
import { Repository } from 'typeorm';
import { StudentsService } from '../students/students.service';
import { IPagination, IResponse } from '../shared/response.interface';
import {
  AcademicPerformance,
  AcademicPerformanceWithRanks,
} from './academics.interface';
import { Student } from '../students/student.entity';

@Injectable()
export class AcademicsService {
  constructor(
    @InjectRepository(Academic)
    private readonly academicRepository: Repository<Academic>,
    private readonly studentsService: StudentsService,
  ) {}

  public async createAcademic(
    academicsDto: AcademicsDto,
    id: string,
  ): Promise<IResponse<Academic>> {
    const student = await this.studentsService.findStudentByUserId(id);
    const findExistingAcademic = await this.academicRepository.findOneBy({
      year: academicsDto.year,
      term: academicsDto.term,
      course: academicsDto.course,
      student: {
        id: student.id,
      },
    });

    if (findExistingAcademic) {
      throw new ConflictException({
        message: 'Academic results already exists with same year and term',
      });
    }

    const academic = new Academic();
    this.setAcademic(academic, academicsDto, student);

    await this.academicRepository.save(academic);

    return {
      message: 'Academic record saved successfully',
      data: academic,
    };
  }

  private academicPerformanceQuery() {
    return this.academicRepository
      .createQueryBuilder('academic')
      .innerJoin('academic.student', 'student')
      .innerJoin('student.school', 'school')
      .select('student.id', 'studentId')
      .addSelect('student.name', 'studentName')
      .addSelect('school.name', 'school')
      .addSelect('student.level', 'grade')
      .addSelect(
        'SUM(academic.score) / COUNT(DISTINCT academic.id)',
        'averageScore',
      )
      .groupBy('student.id')
      .addGroupBy('school.name');
  }

  public async getAcademicsPerformanceRank(
    year: number,
    term: string,
  ): Promise<AcademicPerformance[]> {
    const query = this.academicPerformanceQuery()
      .orderBy('SUM(academic.score) / COUNT(DISTINCT academic.id)', 'DESC')
      .take(3);

    if (year) {
      query.where('academic.year = :year', {
        year,
      });
    }

    if (term) {
      query.andWhere('academic.term = :term', {
        term,
      });
    }

    return await query.getRawMany();
  }

  public async getPerformanceWithRanks(
    page: number,
    searchTerm: string,
    year: number,
    term: string,
  ): Promise<IResponse<AcademicPerformanceWithRanks>> {
    return {
      message: 'Academic performance loaded successfully',
      data: {
        performanceRank: await this.getAcademicsPerformanceRank(year, term),
        academicPerformance: await this.getAcademics(
          page,
          searchTerm,
          year,
          term,
        ),
      },
    };
  }

  public async getBeneficiaryAcademicsPerformance(
    id: string,
    page: number,
    searchTerm: string,
    term: string,
    year: number,
  ): Promise<IResponse<IPagination<Academic[]>>> {
    const studentId = (await this.studentsService.findStudentByUserId(id)).id;
    const skip = (page - 1) * 10;
    const queryBuilder = this.academicRepository
      .createQueryBuilder('academic')
      .innerJoin('academic.student', 'student')
      .where('student.id = :studentId', {
        studentId,
      });

    if (searchTerm) {
      queryBuilder.andWhere('LOWER(academic.course) LIKE LOWER(:searchTerm)', {
        searchTerm: `%${searchTerm}%`,
      });
    }

    if (term) {
      queryBuilder.andWhere('academic.term = :term', {
        term,
      });
    }

    if (year) {
      queryBuilder.andWhere('academic.year = :year', {
        year,
      });
    }

    const [academics, total] = await queryBuilder
      .skip(skip)
      .take(10)
      .getManyAndCount();

    return {
      message: 'Academics records loaded successfully',
      data: {
        total,
        currentPage: page,
        totalPages: Math.ceil(total / 10),
        items: academics,
      },
    };
  }

  async getAcademics(
    page: number,
    searchTerm: string,
    year: number,
    term: string,
  ): Promise<IPagination<AcademicPerformance[]>> {
    const skip = (page - 1) * 10;
    const queryBuilder = this.academicPerformanceQuery();

    if (searchTerm) {
      queryBuilder.where('LOWER(student.name) LIKE LOWER(:searchTerm)', {
        searchTerm: `%${searchTerm}%`,
      });
      queryBuilder.orWhere('LOWER(school.name) LIKE LOWER(:searchTerm)', {
        searchTerm: `%${searchTerm}%`,
      });
    }

    if (year) {
      queryBuilder.andWhere('academic.year = :year', {
        year,
      });
    }

    if (term) {
      queryBuilder.andWhere('academic.term = :term', {
        term,
      });
    }

    const [academics, total] = await Promise.all([
      queryBuilder.skip(skip).take(10).getRawMany(),
      queryBuilder.getCount(),
    ]);

    return {
      total,
      currentPage: page,
      totalPages: Math.ceil(total / 10),
      items: academics,
    };
  }

  public async updateAcademic(
    id: string,
    academicsDto: AcademicsDto,
    userId: string,
  ): Promise<IResponse<Academic>> {
    const academic = await this.academicRepository.findOneByOrFail({
      id,
      student: {
        user: {
          id: userId,
        },
      },
    });
    this.setAcademic(academic, academicsDto);

    await this.academicRepository.save(academic);

    return {
      message: 'Academic record updated successfully',
      data: academic,
    };
  }

  public async deleteAcademic(
    academicId: string,
    userId: string,
  ): Promise<IResponse<Academic>> {
    const academic = await this.academicRepository.findOneByOrFail({
      id: academicId,
      student: {
        user: {
          id: userId,
        },
      },
    });

    await this.academicRepository.remove(academic);

    return {
      message: 'Academic Deleted Successfully',
      data: academic,
    };
  }

  private setAcademic(
    academic: Academic,
    academicsDto: AcademicsDto,
    student?: Student,
  ) {
    if (student) {
      academic.student = student;
    }
    academic.year = academicsDto.year;
    academic.term = academicsDto.term;
    academic.remarks = academicsDto.remarks;
    academic.course = academicsDto.course;
    academic.score = academicsDto.score;
    academic.grade = this.getGrade(academicsDto.score);
  }

  getGrade(score: number): string {
    switch (true) {
      case score >= 90:
        return 'A+';
      case score >= 80:
        return 'A';
      case score >= 75:
        return 'B+';
      case score >= 70:
        return 'B';
      case score >= 65:
        return 'C+';
      case score >= 60:
        return 'C';
      case score >= 55:
        return 'D+';
      case score >= 50:
        return 'D';
      case score >= 40:
        return 'E';
      default:
        return 'F';
    }
  }
}
