import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OtherBudgetDistributionDto } from './dto/other-budget-distribution.dto';
import { Repository } from 'typeorm';
import { OtherBudgetDistribution } from './entities/other-budget-distribution.entity';
import { Budget } from './entities/budget.entity';
import { IResponse } from '../shared/response.interface';
import { FundDto } from './dto/fund.dto';
import { Fund } from './entities/fund.entity';
import { Request } from './entities/request.entity';
import { Disbursement } from './entities/disbursement.entity';
import { CreateDisbursementDto } from './dto/disbursement.dto';
import { StudentsService } from '../students/students.service';
import { requestStatuses, statuses } from '../users/user.interface';
import { periods } from '../utility/constants';
import { NotificationService } from '../shared/notification/notification.service';
import { RequestDto } from './dto/budget-distribution.dto';
import { BudgetDistribution } from './entities/budgetDistribution.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class FinancesService {
  constructor(
    @InjectRepository(BudgetDistribution)
    private readonly budgetDistributionRepository: Repository<BudgetDistribution>,
    @InjectRepository(OtherBudgetDistribution)
    private readonly otherBudgetDistributionRepository: Repository<OtherBudgetDistribution>,
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
    @InjectRepository(Fund)
    private readonly fundRepository: Repository<Fund>,
    @InjectRepository(Disbursement)
    private readonly disbursementRepository: Repository<Disbursement>,
    private readonly studentsService: StudentsService,
    private readonly notificationService: NotificationService,
    private readonly usersService: UsersService,
  ) {}

  async createOtherBudgetDistribution(
    id: string,
    createBudgetDto: OtherBudgetDistributionDto,
  ): Promise<IResponse<OtherBudgetDistribution>> {
    const budget = await this.budgetRepository.findOneByOrFail({ id });
    budget.total += createBudgetDto.amount;
    const newOtherDistribution = this.otherBudgetDistributionRepository.create({
      ...createBudgetDto,
      budget,
    });
    const otherDistribution =
      await this.otherBudgetDistributionRepository.save(newOtherDistribution);
    await this.budgetRepository.save(budget);

    return {
      message: 'Budget distribution created successfully',
      data: otherDistribution,
    };
  }

  async getOtherBudgetDistributions(id: string) {
    return this.otherBudgetDistributionRepository.findBy({
      budget: {
        id,
      },
    });
  }

  async createFund(fundDto: FundDto) {
    const newFund = this.fundRepository.create({ ...fundDto });
    const fund = await this.fundRepository.save(newFund);

    return {
      message: 'Fund added successfully',
      data: fund,
    };
  }

  async getFunds(page: number = 1, period: string, year: number) {
    const skip = (page - 1) * 10;
    const queryBuilder = this.fundRepository
      .createQueryBuilder('fund')
      .orderBy('fund.created_at', 'DESC');

    if (period) {
      queryBuilder.where('fund.period = :period', {
        period,
      });
    }

    if (year) {
      queryBuilder.andWhere('fund.year = :year', {
        year,
      });
    }

    const [funds, total] = await queryBuilder
      .skip(skip)
      .take(10)
      .getManyAndCount();

    return {
      message: 'Funds loaded successfully',
      data: {
        total,
        currentPage: page,
        totalPages: Math.ceil(total / 10),
        items: funds,
      },
    };
  }

  async deleteFund(id: string) {
    const fund = await this.fundRepository.findOneByOrFail({ id });

    await this.fundRepository.remove(fund);

    return {
      message: 'Fund deleted successfully',
      data: fund,
    };
  }

  async editFund(id: string, fundDto: FundDto) {
    const fund = await this.fundRepository.update({ id }, fundDto);

    return {
      message: 'Fund updated successfully',
      data: fund,
    };
  }

  async createDisbursement({
    period,
    amount,
    title,
    studentId,
    year,
  }: CreateDisbursementDto) {
    let newDisbursement: Disbursement;
    if (studentId) {
      const student = await this.studentsService.findStudentById(studentId);
      if (student.status === statuses[1]) {
        throw new ForbiddenException('Student has been deactivated');
      }
      newDisbursement = this.disbursementRepository.create({
        period,
        amount,
        student,
        year,
      });
      const user = await this.studentsService.findUser(studentId);
      if (user) {
        await this.notificationService.sendFundsDisbursedEmail(
          user.email,
          user.name,
          String(amount),
        );
      }
    } else {
      newDisbursement = this.disbursementRepository.create({
        period,
        amount,
        title,
        year,
      });
    }
    const disbursement =
      await this.disbursementRepository.save(newDisbursement);

    return {
      message: 'Disbursement saved successfully',
      data: disbursement,
    };
  }

  async updateDisbursement(
    id: string,
    { period, amount, title, studentId, year }: CreateDisbursementDto,
  ) {
    const existingDisbursement = await this.disbursementRepository.findOneBy({
      id,
    });

    if (!existingDisbursement) {
      throw new NotFoundException(`Disbursement with ID ${id} not found`);
    }

    if (!studentId) {
      existingDisbursement.student = null;
      existingDisbursement.title = title;
    } else {
      existingDisbursement.student =
        await this.studentsService.findStudentById(studentId);
      existingDisbursement.title = null;
    }

    existingDisbursement.period = period;
    existingDisbursement.amount = amount;
    existingDisbursement.year = year;

    const updatedDisbursement =
      await this.disbursementRepository.save(existingDisbursement);

    return {
      message: 'Disbursement updated successfully',
      data: updatedDisbursement,
    };
  }

  async deleteDisbursement(id: string) {
    const disbursement = await this.disbursementRepository.findOneByOrFail({
      id,
    });

    await this.disbursementRepository.remove(disbursement);

    return {
      message: 'Disbursement deleted successfully',
      data: disbursement,
    };
  }

  public async getTotalFunds(year: number, period: string): Promise<number> {
    const queryBuilder = this.fundRepository
      .createQueryBuilder('fund')
      .select('SUM(fund.amount)', 'sum');

    if (year) {
      queryBuilder.where('fund.year = :year', {
        year,
      });
    }

    if (period) {
      queryBuilder.where('fund.period = :period', {
        period,
      });
    }

    const result = await queryBuilder.getRawOne();
    return parseFloat(result.sum);
  }

  getFundsForAccount(whereClause: object) {
    return this.fundRepository.find({
      where: whereClause,
      select: ['id', 'amount', 'title', 'period', 'year', 'created_at'],
    });
  }

  async getFundSummary(
    year: number,
    period: string,
  ): Promise<{ labels: string[]; values: number[] }> {
    const queryBuilder = this.fundRepository
      .createQueryBuilder('fund')
      .select('fund.period', 'period')
      .addSelect('SUM(fund.amount)', 'total')
      .groupBy('fund.period');

    if (year) {
      queryBuilder.where('fund.year = :year', { year });
    }

    if (period) {
      queryBuilder.where('fund.period = :period', { period });
    }

    const result = await queryBuilder.getRawMany();

    const summaryMap = new Map<string, number>();
    result.forEach((item) => {
      summaryMap.set(item.period, parseFloat(item.total));
    });

    const values = periods.map((period) => summaryMap.get(period) || 0);

    return {
      labels: periods,
      values: values,
    };
  }

  async addRequest(
    id: string,
    createRequest: RequestDto,
  ): Promise<IResponse<Request>> {
    const { budgetId } = createRequest;
    const budget = await this.budgetRepository.findOneByOrFail({
      id: budgetId,
    });
    const student = await this.studentsService.findStudentByUserId(id);
    const newRequest = this.requestRepository.create({
      ...createRequest,
      budget,
      student,
    });
    const request = await this.requestRepository.save(newRequest);

    const superAdmins = await this.usersService.getSuperAdmins();
    const total = this.calculateRequestTotal(createRequest);
    for (const { name, email } of superAdmins) {
      await this.notificationService.newRequestEmail(
        email,
        name,
        String(total),
      );
    }

    return {
      message: 'Budget distribution created successfully',
      data: request,
    };
  }

  async editRequest(
    id: string,
    createRequest: RequestDto,
  ): Promise<IResponse<Request>> {
    const {
      budgetId,
      class: newClass,
      extraClasses,
      examFee,
      homeCare,
      provision,
      schoolFeeding,
      school,
      stationery,
      transportation,
      tuition,
      textBooks,
      uniformBag,
      wears,
      excursion,
    } = createRequest;
    const budget = await this.budgetRepository.findOneByOrFail({
      id: budgetId,
    });
    const existingRequest = await this.requestRepository.findOneByOrFail({
      id,
      status: requestStatuses[0],
    });
    existingRequest.class = newClass;
    existingRequest.extraClasses = extraClasses;
    existingRequest.examFee = examFee;
    existingRequest.homeCare = homeCare;
    existingRequest.provision = provision;
    existingRequest.schoolFeeding = schoolFeeding;
    existingRequest.school = school;
    existingRequest.budget = budget;
    existingRequest.wears = wears;
    existingRequest.uniformBag = uniformBag;
    existingRequest.textBooks = textBooks;
    existingRequest.tuition = tuition;
    existingRequest.transportation = transportation;
    existingRequest.stationery = stationery;
    existingRequest.excursion = excursion;

    await this.requestRepository.save(existingRequest);

    return {
      message: 'Request updated successfully',
      data: existingRequest,
    };
  }

  async deleteRequest(id: string): Promise<IResponse<Request>> {
    const existingRequest = await this.requestRepository.findOneByOrFail({
      id,
      status: requestStatuses[0],
    });

    await this.requestRepository.remove(existingRequest);

    return {
      message: 'Budget distribution created successfully',
      data: existingRequest,
    };
  }

  async getRequests(userId: string, page: number = 1, status: string) {
    const skip = (page - 1) * 10;
    const queryBuilder = this.requestRepository
      .createQueryBuilder('request')
      .orderBy('request.created_at', 'DESC')
      .innerJoinAndSelect('request.student', 'student')
      .innerJoinAndSelect('request.budget', 'budget');

    if (userId) {
      const { id } = await this.studentsService.findStudentByUserId(userId);
      queryBuilder.where('student.id = :id', { id });
    }

    if (status) {
      queryBuilder.andWhere('request.status = :status', {
        status,
      });
    }

    const [requests, total] = await queryBuilder
      .skip(skip)
      .take(10)
      .getManyAndCount();

    return {
      message: 'Requests loaded successfully',
      data: {
        total,
        currentPage: page,
        totalPages: Math.ceil(total / 10),
        items: requests,
      },
    };
  }

  async approveRequest(id: string) {
    const request = await this.requestRepository.findOneByOrFail({ id });
    request.status = requestStatuses[1];

    const newDistribution = this.budgetDistributionRepository.create({
      ...request,
    });
    const user = await this.studentsService.findUser(await request.student.id);
    await this.budgetDistributionRepository.save(newDistribution);
    await this.requestRepository.save(request);

    await this.notificationService.sendApproveEmail(
      user.email,
      user.name,
      String(this.calculateRequestTotal(request)),
    );

    return {
      message: 'Request Approved Successfully',
      data: request,
    };
  }

  async declineRequest(id: string) {
    const request = await this.requestRepository.findOneByOrFail({ id });
    request.status = requestStatuses[2];
    const user = await this.studentsService.findUser(await request.student.id);
    await this.requestRepository.save(request);

    await this.notificationService.sendApproveEmail(
      user.email,
      user.name,
      String(this.calculateRequestTotal(request)),
    );

    return {
      message: 'Request declined Successfully',
      data: request,
    };
  }

  async getTotalRequestsByStudent(studentId: string): Promise<number> {
    return await this.requestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.student', 'student')
      .where('student.id = :studentId', { studentId })
      .getCount();
  }

  async getPendingRequestsByStudent(studentId: string): Promise<number> {
    return this.requestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.student', 'student')
      .where('student.id = :studentId', { studentId })
      .andWhere('request.status = :status', { status: requestStatuses[0] })
      .getCount();
  }

  calculateRequestTotal(requestDto: RequestDto | Request): number {
    return (
      requestDto.tuition +
      requestDto.textBooks +
      requestDto.extraClasses +
      requestDto.examFee +
      requestDto.homeCare +
      requestDto.uniformBag +
      requestDto.excursion +
      requestDto.transportation +
      requestDto.wears +
      requestDto.schoolFeeding +
      requestDto.provision +
      requestDto.stationery
    );
  }
}
