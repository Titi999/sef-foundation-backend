import { Injectable } from '@nestjs/common';
import { CreateBudgetDto } from './dto/budget.dto';
import { BudgetDistribution } from './entities/budgetDistribution.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from './entities/budget.entity';
import {
  IMonthTotal,
  IOverviewStatistics,
  IPagination,
  IResponse,
} from '../shared/response.interface';
import { Disbursement } from './entities/disbursement.entity';
import {
  CreateBeneficiaryDisbursemenDto,
  CreateDisbursementDto,
} from './dto/disbursement.dto';
import { StudentsService } from '../students/students.service';
import { DisbursementDistribution } from './entities/disbursementDistribution.entity';
import {
  disbursementStatuses,
  disbursementStatusesType,
  statuses,
} from '../users/user.interface';
import { monthNames } from '../utility/constants';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(BudgetDistribution)
    private readonly budgetDistributionRepository: Repository<BudgetDistribution>,
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
    @InjectRepository(Disbursement)
    private readonly disbursementRepository: Repository<Disbursement>,
    @InjectRepository(DisbursementDistribution)
    private readonly disbursementDistributionRepository: Repository<DisbursementDistribution>,
    private readonly studentsService: StudentsService,
  ) {}

  async createBudget(
    createBudgetDto: CreateBudgetDto,
  ): Promise<IResponse<Budget>> {
    const activeBudget = await this.budgetRepository.findOneBy({
      status: statuses[0],
    });
    if (activeBudget) {
      activeBudget.status = statuses[1];
      await this.budgetRepository.save(activeBudget);
    }
    const budget = new Budget();
    await this.setBudget(createBudgetDto, budget);
    await this.budgetRepository.save(budget);
    return {
      message: 'Budget saved successfully',
      data: budget,
    };
  }

  async getBudgets(
    page: number = 1,
  ): Promise<IResponse<IPagination<Budget[]>>> {
    const skip = (page - 1) * 10;
    const queryBuilder = this.budgetRepository.createQueryBuilder('budget');

    const [budgets, total] = await queryBuilder
      .skip(skip)
      .take(10)
      .getManyAndCount();

    return {
      message: 'Budgets loaded successfully',
      data: {
        total,
        currentPage: page,
        totalPages: Math.ceil(total / 10),
        items: budgets,
      },
    };
  }

  async getBudget(id: string): Promise<IResponse<Budget>> {
    const budget = await this.budgetRepository.findOneByOrFail({ id });

    return {
      message: 'Budget loaded successfully',
      data: budget,
    };
  }

  async editBudget(
    id: string,
    createBudgetDto: CreateBudgetDto,
  ): Promise<IResponse<Budget>> {
    const budget = await this.budgetRepository.findOneByOrFail({ id });
    await this.setBudget(createBudgetDto, budget);
    await this.budgetRepository.save(budget);
    return {
      message: 'Budget edit successfully',
      data: budget,
    };
  }

  async deleteBudget(id: string): Promise<IResponse<Budget>> {
    const budget = await this.budgetRepository.findOneByOrFail({ id });
    await this.budgetRepository.remove(budget);
    return {
      message: 'Budget deleted successfully',
      data: budget,
    };
  }

  private async setBudget(createBudgetDto: CreateBudgetDto, budget: Budget) {
    const budgetDistributions = await Promise.all(
      createBudgetDto.distributions.map(async (distribution) => {
        const newDistribution = new BudgetDistribution();
        newDistribution.amount = distribution.amount;
        newDistribution.title = distribution.title;
        return this.budgetDistributionRepository.save(newDistribution);
      }),
    );
    budget.budgetDistribution = budgetDistributions;
    budget.totalDistribution =
      this.getBudgetDistributionTotal(budgetDistributions);
    budget.total = createBudgetDto.total;
    budget.utilized = 0;
    budget.surplus = createBudgetDto.total;
    budget.startDate = createBudgetDto.startDate;
    budget.endDate = createBudgetDto.endDate;
  }

  private getBudgetDistributionTotal(
    budgetDistributions: BudgetDistribution[],
  ): number {
    return budgetDistributions.reduce(
      (total, budgetDistribution) => total + budgetDistribution.amount,
      0,
    );
  }

  public async getDisbursement(id: string): Promise<IResponse<Disbursement>> {
    const disbursement = await this.disbursementRepository.findOneByOrFail({
      id,
    });

    return {
      message: 'Disbursement loaded successfully',
      data: disbursement,
    };
  }

  async getDisbursements(
    page: number = 1,
  ): Promise<IResponse<IPagination<Disbursement[]>>> {
    const skip = (page - 1) * 10;
    const queryBuilder =
      this.disbursementRepository.createQueryBuilder('disbursement');
    queryBuilder.innerJoinAndSelect('disbursement.student', 'student');
    const [disbursements, total] = await queryBuilder
      .skip(skip)
      .take(10)
      .getManyAndCount();

    return {
      message: 'Disbursements loaded successfully',
      data: {
        total,
        currentPage: page,
        totalPages: Math.ceil(total / 10),
        items: disbursements,
      },
    };
  }

  async getBeneficiaryDisbursements(
    id: string,
    page: number = 1,
    status: disbursementStatusesType,
  ): Promise<IResponse<IPagination<Disbursement[]>>> {
    const studentId = (await this.studentsService.findStudentByUserId(id)).id;
    const skip = (page - 1) * 10;
    const queryBuilder =
      this.disbursementRepository.createQueryBuilder('disbursement');
    queryBuilder.where('disbursement.studentId = :studentId', {
      studentId,
    });
    if (status) {
      queryBuilder.andWhere('disbursement.status = :status', {
        status,
      });
    }
    const [disbursements, total] = await queryBuilder
      .skip(skip)
      .take(10)
      .getManyAndCount();

    return {
      message: 'Disbursements loaded successfully',
      data: {
        total,
        currentPage: page,
        totalPages: Math.ceil(total / 10),
        items: disbursements,
      },
    };
  }

  async createDisbursement(
    createDisbursementDto: CreateDisbursementDto,
  ): Promise<IResponse<Disbursement>> {
    const disbursement = new Disbursement();
    const budget = await this.budgetRepository.findOneByOrFail({
      status: statuses[0],
    });
    const student = await this.studentsService.getStudentById(
      createDisbursementDto.studentId,
    );
    disbursement.amount = createDisbursementDto.amount;
    disbursement.budget = budget;
    disbursement.student = student;
    disbursement.disbursementDistribution = await Promise.all(
      createDisbursementDto.disbursementDistribution.map(
        async (distribution) => {
          const newDistribution = new DisbursementDistribution();
          newDistribution.amount = distribution.amount;
          newDistribution.title = distribution.title;
          return this.disbursementDistributionRepository.save(newDistribution);
        },
      ),
    );

    await this.disbursementRepository.save(disbursement);

    return {
      message: 'You have successfully created a disbursement',
      data: disbursement,
    };
  }

  public async createBeneficiaryDisbursement(
    id: string,
    createBeneficiaryDisbursementDto: CreateBeneficiaryDisbursemenDto,
  ): Promise<IResponse<Disbursement>> {
    const studentId = (await this.studentsService.findStudentByUserId(id)).id;
    const createDisbursementDto: CreateDisbursementDto = {
      studentId,
      ...createBeneficiaryDisbursementDto,
    };
    return await this.createDisbursement(createDisbursementDto);
  }

  public async approveDisbursement(
    id: string,
  ): Promise<IResponse<Disbursement>> {
    const disbursement = await this.disbursementRepository.findOneByOrFail({
      id,
    });

    disbursement.status = 'approved';
    const budgetId = await disbursement.budget.id;
    const budget = await this.budgetRepository.findOneByOrFail({
      id: budgetId,
    });
    budget.utilized += disbursement.amount;
    budget.surplus = budget.total - budget.utilized;

    await this.budgetRepository.save(budget);
    await this.disbursementRepository.save(disbursement);

    return {
      message: 'Disbursement approved successfully',
      data: disbursement,
    };
  }

  public async declineDisbursement(
    id: string,
  ): Promise<IResponse<Disbursement>> {
    const disbursement = await this.disbursementRepository.findOneByOrFail({
      id,
    });
    disbursement.status = 'declined';
    await this.disbursementRepository.save(disbursement);

    return {
      message: 'Disbursement declined successfully',
      data: disbursement,
    };
  }

  public async getOverviewStats(
    year: number,
  ): Promise<IResponse<IOverviewStatistics>> {
    return {
      message: 'You have successfully loaded statistics',
      data: {
        totalFundingDisbursed: await this.totalFundingDisbursedStats(year),
        fundingDistribution: await this.getBudgetDistributions(year),
        fundsAllocated: await this.getFundsAllocated(year),
        fundsDisbursed: await this.getFundsDisbursed(year),
        studentsSupported: await this.studentsService.getAllStudentsCount(),
      },
    };
  }

  private async totalFundingDisbursedStats(
    year?: number,
  ): Promise<IMonthTotal[]> {
    const queryBuilder = this.disbursementRepository
      .createQueryBuilder('disbursement')
      .select('EXTRACT(MONTH FROM disbursement.created_at)', 'month')
      .addSelect('SUM(disbursement.amount)', 'total')
      .groupBy('EXTRACT(MONTH FROM disbursement.created_at)')
      .orderBy('EXTRACT(MONTH FROM disbursement.created_at)', 'ASC');

    queryBuilder.where('disbursement.status = :status', {
      status: disbursementStatuses[1],
    });

    if (year) {
      queryBuilder.where('EXTRACT(YEAR FROM disbursement.created_at) = :year', {
        year,
      });
    }
    const rawResults = await queryBuilder.getRawMany();
    return rawResults.map((result) => ({
      month: monthNames[result.month - 1],
      total: parseFloat(result.total),
    }));
  }

  private async getBudgetDistributions(
    year?: number,
  ): Promise<{ title: string; amount: number }[]> {
    const queryBuilder = this.budgetDistributionRepository
      .createQueryBuilder('budgetDistribution')
      .select(['budgetDistribution.title', 'budgetDistribution.amount']);
    if (year) {
      queryBuilder.where(
        'EXTRACT(YEAR FROM budgetDistribution.created_at) = :year',
        { year },
      );
    }

    const rawResults = await queryBuilder.getRawMany();

    return rawResults.map((result) => ({
      title: result.budgetDistribution_title,
      amount: parseFloat(result.budgetDistribution_amount),
    }));
  }

  private async getFundsAllocated(year?: number): Promise<number> {
    const queryBuilder = this.budgetRepository
      .createQueryBuilder('budget')
      .select('SUM(budget.total)', 'sum');

    if (year) {
      queryBuilder.where('EXTRACT(YEAR FROM budget.created_at) = :year', {
        year,
      });
    }

    const result = await queryBuilder.getRawOne();
    return parseFloat(result.sum);
  }

  private async getFundsDisbursed(year?: number): Promise<number> {
    const queryBuilder = this.disbursementRepository
      .createQueryBuilder('disbursement')
      .select('SUM(disbursement.amount)', 'sum');

    queryBuilder.where('disbursement.status = :status', {
      status: disbursementStatuses[1],
    });

    if (year) {
      queryBuilder.where('EXTRACT(YEAR FROM disbursement.created_at) = :year', {
        year,
      });
    }

    const result = await queryBuilder.getRawOne();
    return parseFloat(result.sum);
  }
}
