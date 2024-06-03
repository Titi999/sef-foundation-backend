import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { School } from './school.entity';
import { Repository } from 'typeorm';
import { CreateSchoolDto } from './schools.dto';
import { IPagination, IResponse } from '../shared/response.interface';
import { statuses, statusesTypes } from '../users/user.interface';

@Injectable()
export class SchoolsService {
  constructor(
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,
  ) {}

  public async createSchool(
    createSchoolDto: CreateSchoolDto,
  ): Promise<IResponse<School>> {
    const school = new School();
    this.setSchool(school, createSchoolDto);
    await this.schoolRepository.save(school);

    return {
      message: 'You have successfully created a school',
      data: school,
    };
  }

  private setSchool(school: School, createSchoolDto: CreateSchoolDto) {
    school.email = createSchoolDto.email;
    school.name = createSchoolDto.name;
    school.phone = createSchoolDto.phone;
    school.location = createSchoolDto.location;
  }

  async getSchools(
    page: number = 1,
    searchTerm: string = '',
    status: statusesTypes = statuses[0],
  ): Promise<IResponse<IPagination<School[]>>> {
    const skip = (page - 1) * 10;
    const queryBuilder = this.schoolRepository.createQueryBuilder('school');

    if (searchTerm) {
      queryBuilder.where('LOWER(school.name) LIKE LOWER(:searchTerm)', {
        searchTerm: `%${searchTerm}%`,
      });
    }

    if (status) {
      queryBuilder.where('LOWER(school.status) = LOWER(:status)', {
        status,
      });
    }

    const [schools, total] = await queryBuilder
      .skip(skip)
      .take(10)
      .getManyAndCount();

    return {
      message: 'Schools loaded successfully',
      data: {
        total,
        currentPage: page,
        totalPages: Math.ceil(total / 10),
        items: schools,
      },
    };
  }

  public async updateSchool(
    id: string,
    createSchoolDto: CreateSchoolDto,
  ): Promise<IResponse<School>> {
    const school = await this.schoolRepository.findOneByOrFail({ id });
    this.setSchool(school, createSchoolDto);
    await this.schoolRepository.save(school);

    return {
      message: 'School successfully updated',
      data: school,
    };
  }

  public async deleteSchool(id: string): Promise<IResponse<School>> {
    const school = await this.findSchoolById(id);
    await this.schoolRepository.remove(school);

    return {
      message: 'School successfully deleted',
      data: school,
    };
  }

  public findSchoolById(id: string): Promise<School> {
    return this.schoolRepository.findOneByOrFail({ id });
  }
}
