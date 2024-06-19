import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
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
    school.classes = createSchoolDto.classes;
  }

  async getSchools(
    page: number = 1,
    searchTerm: string = '',
    status: statusesTypes,
  ): Promise<IResponse<IPagination<School[]>>> {
    const skip = (page - 1) * 10;
    const queryBuilder = this.schoolRepository.createQueryBuilder('school');

    if (searchTerm) {
      queryBuilder.where('LOWER(school.name) LIKE LOWER(:searchTerm)', {
        searchTerm: `%${searchTerm}%`,
      });
    }

    if (status) {
      queryBuilder.andWhere('LOWER(school.status) = LOWER(:status)', {
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
    try {
      await this.schoolRepository.remove(school);
      return {
        message: 'School successfully deleted',
        data: school,
      };
    } catch (error) {
      if (error.driverError.code === '23503') {
        throw new ConflictException(
          'This school cannot be deleted as it has relations with students',
        );
      }

      throw new InternalServerErrorException();
    }
  }

  public findSchoolById(id: string): Promise<School> {
    return this.schoolRepository.findOneByOrFail({ id });
  }

  public async getAllSchools(): Promise<IResponse<School[]>> {
    const school = await this.schoolRepository.findBy({
      status: statuses[0],
    });
    return {
      message: 'Schools loaded successfully',
      data: school,
    };
  }

  public async activateSchool(id: string): Promise<IResponse<School>> {
    const school = await this.schoolRepository.findOneByOrFail({ id });
    school.status = statuses[0];
    await this.schoolRepository.save(school);
    return {
      message: 'Schools activated successfully',
      data: school,
    };
  }

  public async deactivateSchool(id: string): Promise<IResponse<School>> {
    const school = await this.schoolRepository.findOneByOrFail({ id });
    school.status = statuses[1];
    await this.schoolRepository.save(school);
    return {
      message: 'Schools deactivated successfully',
      data: school,
    };
  }
}
