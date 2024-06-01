import { Injectable } from '@nestjs/common';
import { CreateBudgetDto } from './dto/budget.dto';
import { BudgetDistribution } from './entities/budgetDistribution.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from './entities/budget.entity';
import { IPagination, IResponse } from '../shared/response.interface';
import { Disbursement } from './entities/disbursement.entity';
import { CreateDisbursementDto } from './dto/disbursement.dto';
import { StudentsService } from '../students/students.service';
import { DisbursementDistribution } from './entities/disbursementDistribution.entity';
import { statuses } from '../users/user.interface';

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
    private readonly disbursementDistribution: DisbursementDistribution,
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
      this.disbursementRepository.createQueryBuilder('budget');

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
      id: createDisbursementDto.budgetId,
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
          return this.disbursementRepository.save(newDistribution);
        },
      ),
    );

    await this.disbursementRepository.save(disbursement);

    return {
      message: 'You have successfully created a disbursement',
      data: disbursement,
    };
  }
}
