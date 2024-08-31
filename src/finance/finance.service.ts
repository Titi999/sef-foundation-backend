import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBudgetDto } from './dto/budget.dto';
import { BudgetDistribution } from './entities/budgetDistribution.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from './entities/budget.entity';
import {
  FinanceReportInterface,
  IBeneficiaryOverviewStatistics,
  IOverviewStatistics,
  IPagination,
  IPerformance,
  IResponse,
  IStudentPerformanceRanks,
} from '../shared/response.interface';
import {
  Disbursement,
  DisbursementWithStudent,
} from './entities/disbursement.entity';
import { StudentsService } from '../students/students.service';
import { disbursementStatusesType } from '../users/user.interface';
import { BudgetDistributionDto } from './dto/budget-distribution.dto';
import { AccountingRow, BudgetDetails } from './finance.interface';
import { FinancesService } from './finances.service';
import { periods } from '../utility/constants';
import { NotificationService } from '../shared/notification/notification.service';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(BudgetDistribution)
    private readonly budgetDistributionRepository: Repository<BudgetDistribution>,
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
    @InjectRepository(Disbursement)
    private readonly disbursementRepository: Repository<Disbursement>,
    private readonly studentsService: StudentsService,
    private readonly financesService: FinancesService,
    private readonly notificationService: NotificationService,
  ) {}

  async addBudgetDistribution(
    id: string,
    createBudgetDistributions: BudgetDistributionDto[],
  ): Promise<IResponse<BudgetDistribution[]>> {
    const budget = await this.budgetRepository.findOneByOrFail({ id });

    const studentCodes = createBudgetDistributions.map(
      ({ studentCode }) => studentCode,
    );
    const students =
      await this.studentsService.findStudentsByCodes(studentCodes);

    const distributions = await Promise.all(
      createBudgetDistributions.map(async (createBudgetDistribution) => {
        const distributionTotal = this.calculateBudgetTotal(
          createBudgetDistribution,
        );
        budget.total += distributionTotal;

        const student = students.find(
          (s) => s.code === createBudgetDistribution.studentCode,
        );
        if (!student) {
          throw new NotFoundException(
            `Student with code ${createBudgetDistribution.studentCode} not found or has been deactivated`,
          );
        }

        if (student.user) {
          await this.notificationService.sendFundsAllocatedEmail(
            student.user.email,
            student.user.name,
            String(distributionTotal),
          );
        }

        const budgetDistribution = this.budgetDistributionRepository.create({
          ...createBudgetDistribution,
          student,
          budget,
        });

        return this.budgetDistributionRepository.save(budgetDistribution);
      }),
    );

    await this.budgetRepository.save(budget);
    await this.budgetRepository.save(budget);

    return {
      message: 'Budget distribution created successfully',
      data: distributions,
    };
  }

  calculateBudgetTotal(budgetDistributionDto: BudgetDistributionDto): number {
    return (
      budgetDistributionDto.tuition +
      budgetDistributionDto.textBooks +
      budgetDistributionDto.extraClasses +
      budgetDistributionDto.examFee +
      budgetDistributionDto.homeCare +
      budgetDistributionDto.uniformBag +
      budgetDistributionDto.excursion +
      budgetDistributionDto.transportation +
      budgetDistributionDto.wears +
      budgetDistributionDto.schoolFeeding +
      budgetDistributionDto.provision +
      budgetDistributionDto.stationery
    );
  }

  async createBudget({
    period,
    year,
  }: CreateBudgetDto): Promise<IResponse<Budget>> {
    const existingBudget = await this.budgetRepository.findOneBy({
      period,
      year,
    });

    if (existingBudget) {
      throw new ConflictException('Budget within same period already exists');
    }
    const budget = new Budget();
    budget.total = 0;
    budget.year = year;
    budget.period = period;
    await this.budgetRepository.save(budget);
    return {
      message: 'Budget saved successfully',
      data: budget,
    };
  }

  async getAllBudgets(): Promise<IResponse<Budget[]>> {
    const budgets = await this.budgetRepository.find();

    return {
      message: 'You have successfully loaded all budgets',
      data: budgets,
    };
  }

  async getBudgetDetails(
    id: string,
    search: string,
  ): Promise<IResponse<BudgetDetails>> {
    return {
      message: 'Budget details loaded successfully',
      data: {
        budget: await this.budgetRepository.findOneByOrFail({ id }),
        budgetDistribution: (await this.getBudgetDistribution(id, search)).data,
        otherBudgetDistribution:
          await this.financesService.getOtherBudgetDistributions(id),
        splitDetails: await this.getBudgetSplitStats(search, id),
      },
    };
  }

  async getBudgetSplitStats(
    search?: string,
    id?: string,
    year?: number,
    period?: string,
    studentId?: string,
  ) {
    const queryBuilder = this.budgetDistributionRepository
      .createQueryBuilder('bd')
      .leftJoin('bd.student', 'student')
      .leftJoin('bd.budget', 'budget')
      .select([
        'SUM(bd.tuition) as tuition',
        'SUM(bd.textBooks) as textBooks',
        'SUM(bd.extraClasses) as extraClasses',
        'SUM(bd.examFee) as examFee',
        'SUM(bd.homeCare) as homeCare',
        'SUM(bd.uniformBag) as uniformBag',
        'SUM(bd.excursion) as excursion',
        'SUM(bd.transportation) as transportation',
        'SUM(bd.wears) as wears',
        'SUM(bd.schoolFeeding) as schoolFeeding',
        'SUM(bd.stationery) as stationery',
        'SUM(bd.provision) as provision',
      ]);

    if (studentId) {
      queryBuilder.where('student.id = :studentId', {
        studentId,
      });
    }

    if (id) {
      queryBuilder.where('bd.budgetId = :id', {
        id,
      });
    }

    if (year) {
      queryBuilder.where('budget.year = :year', {
        year,
      });
    }

    if (period) {
      queryBuilder.where('budget.period = :period', {
        period,
      });
    }

    if (search) {
      queryBuilder.where('LOWER(student.name) LIKE LOWER(:searchTerm)', {
        searchTerm: `%${search}%`,
      });
      queryBuilder.orWhere('LOWER(bd.class) LIKE LOWER(:searchTerm)', {
        searchTerm: `%${search}%`,
      });
      queryBuilder.orWhere('LOWER(bd.school) LIKE LOWER(:searchTerm)', {
        searchTerm: `%${search}%`,
      });
    }
    const result = await queryBuilder.getRawOne();

    const labelMap = {
      tuition: 'Tuition',
      textbooks: 'Text Books',
      extraclasses: 'Extra Classes',
      examfee: 'Exam Fee',
      homecare: 'Home Care',
      uniformbag: 'Uniform & Bag',
      excursion: 'Excursion',
      transportation: 'Transportation',
      wears: 'Wears',
      schoolFeeding: 'School Feeding',
      stationery: 'Stationery',
      provision: 'Provision',
    };

    const orderedKeys = [
      'tuition',
      'textbooks',
      'extraclasses',
      'examfee',
      'homecare',
      'uniformbag',
      'excursion',
      'transportation',
      'wears',
      'schoolfeeding',
      'stationery',
      'provision',
    ];

    const labels = orderedKeys.map((key) => labelMap[key]);
    const values = orderedKeys.map((key) => Number(result[key]));

    return { labels, values };
  }

  async getBudgetDistribution(
    id: string,
    search: string,
  ): Promise<IResponse<BudgetDistribution[]>> {
    const queryBuilder = this.budgetDistributionRepository
      .createQueryBuilder('budgetDistribution')
      .where('budgetDistribution.budgetId = :id', {
        id,
      })
      .leftJoinAndSelect('budgetDistribution.student', 'student');

    if (search) {
      queryBuilder.where('LOWER(student.name) LIKE LOWER(:searchTerm)', {
        searchTerm: `%${search}%`,
      });
      queryBuilder.orWhere(
        'LOWER(budgetDistribution.class) LIKE LOWER(:searchTerm)',
        {
          searchTerm: `%${search}%`,
        },
      );
      queryBuilder.orWhere(
        'LOWER(budgetDistribution.school) LIKE LOWER(:searchTerm)',
        {
          searchTerm: `%${search}%`,
        },
      );
    }

    const [budgetDistributions] = await queryBuilder.getManyAndCount();

    return {
      message: 'Budget Distributions loaded successfully',
      data: budgetDistributions,
    };
  }

  async getBudgets(
    page: number = 1,
    period: string,
    year: string,
  ): Promise<IResponse<IPagination<Budget[]>>> {
    const skip = (page - 1) * 10;
    const queryBuilder = this.budgetRepository.createQueryBuilder('budget');

    if (period) {
      queryBuilder.andWhere('budget.period = :period', {
        period,
      });
    }

    if (year) {
      queryBuilder.andWhere('budget.year = :year', {
        year,
      });
    }

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
    { period }: CreateBudgetDto,
  ): Promise<IResponse<Budget>> {
    const budget = await this.budgetRepository.findOneByOrFail({ id });
    budget.period = period;
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

  public async getDisbursement(id: string): Promise<IResponse<Disbursement>> {
    const disbursement = await this.disbursementRepository.findOneOrFail({
      where: {
        id,
      },
      relations: ['student'],
    });

    return {
      message: 'Disbursement loaded successfully',
      data: disbursement,
    };
  }

  async getDisbursements(
    page: number = 1,
    search: string,
    year: number,
    period: string,
  ): Promise<IResponse<IPagination<Disbursement[]>>> {
    const skip = (page - 1) * 10;
    const queryBuilder = this.disbursementRepository
      .createQueryBuilder('disbursement')
      .leftJoinAndSelect('disbursement.student', 'student');

    if (search) {
      queryBuilder.andWhere(
        '(' +
          'LOWER(student.name) LIKE LOWER(:search) OR ' +
          '(student.id IS NULL AND LOWER(disbursement.title) LIKE LOWER(:search))' +
          ')',
        { search: `%${search}%` },
      );
    }

    if (period) {
      queryBuilder.andWhere('disbursement.period = :period', {
        period,
      });
    }

    if (year) {
      queryBuilder.andWhere('disbursement.year = :year', {
        year,
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

  public async getOverviewStats(
    year: number,
    period: string,
  ): Promise<IResponse<IOverviewStatistics>> {
    return {
      message: 'You have successfully loaded statistics',
      data: {
        totalFundingDisbursed: await this.getDisbursementSummary(year, period),
        fundingDistribution: await this.getBudgetSplitStats(
          '',
          '',
          year,
          period,
        ),
        fundsAllocated: await this.getFundsAllocated(year, period),
        fundsDisbursed: await this.getFundsDisbursed(year, period),
        studentsSupported: await this.studentsService.getAllStudentsCount(year),
        totalFunds: await this.financesService.getTotalFunds(year, period),
      },
    };
  }

  public async getBeneficiaryOverviewStats(
    userId: string,
    period: string,
    year: number,
  ): Promise<IResponse<IBeneficiaryOverviewStatistics>> {
    const { id } = await this.studentsService.findStudentByUserId(userId);
    return {
      message: 'You have successfully loaded statistics',
      data: {
        totalFundingDisbursed: await this.getDisbursementSummary(
          year,
          period,
          id,
        ),
        pendingRequests:
          await this.financesService.getPendingRequestsByStudent(id),
        totalRequests: await this.financesService.getTotalRequestsByStudent(id),
        fundingDistribution: await this.getBudgetSplitStats(
          '',
          '',
          year,
          period,
          id,
        ),
        fundsDisbursed: await this.getFundsDisbursed(year, period, id),
        fundsAllocated: await this.getFundsAllocatedToBeneficiary(
          id,
          period,
          year,
        ),
      },
    };
  }

  public async getDisbursementPerformance(
    type: string,
    year: number,
    categories: string[],
  ): Promise<IStudentPerformanceRanks[]> {
    const queryBuilder = this.disbursementRepository
      .createQueryBuilder('d')
      .innerJoin('d.student', 's')
      .innerJoin('s.school', 'sch')
      .select('s.name', 'student')
      .addSelect('s.level', 'level')
      .addSelect('sch.name', 'school')
      .addSelect('SUM(d.amount)', 'totalDisbursement')
      .groupBy('s.id')
      .addGroupBy('sch.name')
      .orderBy('SUM(d.amount)', 'DESC');

    if (type) {
      queryBuilder.where('LOWER(d.status) LIKE LOWER(:status)', {
        status: `%${type}%`,
      });
    }

    if (year) {
      queryBuilder.andWhere('EXTRACT(YEAR FROM d.created_at) = :year', {
        year,
      });
    }

    if (categories && categories.length > 0) {
      queryBuilder.andWhere('s.level IN (:...categories)', {
        categories,
      });
    }

    return (await queryBuilder.getRawMany()).map((row) => ({
      student: row.student,
      totalDisbursement: row.totalDisbursement,
      level: row.level,
      school: row.school,
    }));
  }

  private async getFundsAllocatedToBeneficiary(
    id: string,
    period?: string,
    year?: number,
  ): Promise<number> {
    const query = this.budgetDistributionRepository
      .createQueryBuilder('budgetDistribution')
      .innerJoin('budgetDistribution.student', 'student')
      .innerJoin('budgetDistribution.budget', 'budget')
      .where('student.id = :id', { id });

    if (period) {
      query.andWhere('budget.period = :period', { period });
    }

    if (year) {
      query.andWhere('budget.year = :year', { year });
    }

    const budgetDistributions = await query.getMany();
    console.log(budgetDistributions);

    return budgetDistributions.reduce((sum, distribution) => {
      return (
        sum +
        (distribution.tuition +
          distribution.textBooks +
          distribution.extraClasses +
          distribution.examFee +
          distribution.homeCare +
          distribution.uniformBag +
          distribution.excursion +
          distribution.transportation +
          distribution.wears +
          distribution.schoolFeeding +
          distribution.stationery +
          distribution.provision)
      );
    }, 0);
  }

  private async getFundsAllocated(
    year?: number,
    period?: string,
  ): Promise<number> {
    const queryBuilder = this.budgetRepository
      .createQueryBuilder('budget')
      .select('SUM(budget.total)', 'sum');

    if (year) {
      queryBuilder.where('budget.year = :year', {
        year,
      });
    }

    if (period) {
      queryBuilder.andWhere('budget.period = :period', {
        period,
      });
    }

    const result = await queryBuilder.getRawOne();
    return parseFloat(result.sum);
  }

  async getDisbursementSummary(
    year: number,
    period: string,
    id?: string,
  ): Promise<{ labels: string[]; values: number[] }> {
    const queryBuilder = this.disbursementRepository
      .createQueryBuilder('disbursement')
      .select('disbursement.period', 'period')
      .addSelect('SUM(disbursement.amount)', 'total')
      .groupBy('disbursement.period');

    if (id) {
      queryBuilder
        .innerJoin('disbursement.student', 'student')
        .andWhere('student.id = :id', {
          id,
        });
    }

    if (year) {
      queryBuilder.where('disbursement.year = :year', { year });
    }

    if (period) {
      queryBuilder.where('disbursement.period = :period', { period });
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

  async getBudgetSummary(
    year: number,
    period: string,
  ): Promise<{ labels: string[]; values: number[] }> {
    const queryBuilder = this.budgetRepository
      .createQueryBuilder('budget')
      .select('budget.period', 'period')
      .addSelect('SUM(budget.total)', 'total')
      .groupBy('budget.period');

    if (year) {
      queryBuilder.where('budget.year = :year', { year });
    }

    if (period) {
      queryBuilder.where('budget.period = :period', { period });
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

  private async getFundsDisbursed(
    year: number,
    period: string,
    id?: string,
  ): Promise<number> {
    const queryBuilder = this.disbursementRepository
      .createQueryBuilder('disbursement')
      .select('SUM(disbursement.amount)', 'sum');

    if (id) {
      queryBuilder
        .innerJoin('disbursement.student', 'student')
        .andWhere('student.id = :id', {
          id,
        });
    }

    if (year) {
      queryBuilder.andWhere('disbursement.year = :year', {
        year,
      });
    }

    if (period) {
      queryBuilder.andWhere('disbursement.period = :period', {
        period,
      });
    }

    const result = await queryBuilder.getRawOne();
    return parseFloat(result.sum);
  }

  public async getPerformanceReport(
    page: number,
    search: string,
    type: string,
    year: number,
    category: string,
  ): Promise<IResponse<IPerformance>> {
    const categories = category ? category.split(',') : [];

    return {
      message: 'Students performance loaded successfully',
      data: {
        studentPerformanceRank: await this.getDisbursementPerformance(
          type,
          year,
          categories,
        ),
        studentTotalDisbursements: await this.getTotalDisbursements(
          page,
          search,
          type,
          year,
          categories,
        ),
      },
    };
  }

  async getTotalDisbursements(
    page: number = 1,
    search: string,
    type: string,
    year: number,
    categories: string[],
  ): Promise<IPagination<IStudentPerformanceRanks[]>> {
    const skip = (page - 1) * 10;
    const take = 10;

    // Query to get the total count of grouped disbursements
    const countQueryBuilder = this.disbursementRepository
      .createQueryBuilder('d')
      .innerJoin('d.student', 's')
      .innerJoin('s.school', 'sch')
      .select('s.id', 'id')
      .addSelect('COUNT(*)', 'count')
      .groupBy('s.id')
      .addGroupBy('sch.name');

    const countResult = await countQueryBuilder.getRawMany();
    const total = countResult.length;

    // Query to get the paginated results with total disbursements
    const queryBuilder = this.disbursementRepository
      .createQueryBuilder('d')
      .innerJoin('d.student', 's')
      .innerJoin('s.school', 'sch')
      .select('s.name', 'student')
      .addSelect('s.level', 'level')
      .addSelect('sch.name', 'school')
      .addSelect('SUM(d.amount)', 'totalDisbursement')
      .groupBy('s.id')
      .addGroupBy('sch.name')
      .orderBy('SUM(d.amount)', 'DESC')
      .offset(skip)
      .limit(take);

    if (search) {
      queryBuilder.where('LOWER(s.name) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
      queryBuilder.orWhere('LOWER(sch.name) LIKE LOWER(:searchTerm)', {
        searchTerm: `%${search}%`,
      });
    }

    if (type) {
      queryBuilder.andWhere('LOWER(d.status) LIKE LOWER(:status)', {
        status: `%${type}%`,
      });
    }

    if (year) {
      queryBuilder.andWhere('EXTRACT(YEAR FROM d.created_at) = :year', {
        year,
      });
    }

    if (categories && categories.length > 0) {
      queryBuilder.andWhere('s.level IN (:...categories)', {
        categories,
      });
    }

    const disbursements = await queryBuilder.getRawMany();

    const results: IStudentPerformanceRanks[] = disbursements.map((row) => ({
      student: row.student,
      totalDisbursement: parseFloat(row.totalDisbursement),
      level: row.level,
      school: row.school,
    }));

    return {
      total,
      currentPage: page,
      totalPages: Math.ceil(total / take),
      items: results,
    };
  }

  async getFinanceReport(
    period: string,
    year: number,
  ): Promise<IResponse<FinanceReportInterface>> {
    return {
      message: 'Finance Report generated successfully',
      data: {
        ...(await this.getAccountingTable(period, year)),
        summaryChart: {
          budget: await this.getBudgetSummary(year, period),
          disbursements: await this.getDisbursementSummary(year, period),
          fund: await this.financesService.getFundSummary(year, period),
        },
      },
    };
  }

  async getAccountingTable(
    period?: string,
    year?: number,
  ): Promise<{ accounting: AccountingRow[]; runningTotal: number }> {
    const whereClause = {};
    if (period) whereClause['period'] = period;
    if (year) whereClause['year'] = year;

    const [budgets, disbursements, funds] = await Promise.all([
      this.budgetRepository.find({
        where: whereClause,
        select: ['id', 'total', 'year', 'period', 'created_at'],
      }),
      this.disbursementRepository.find({
        where: whereClause,
        relations: ['student'],
        select: [
          'id',
          'amount',
          'title',
          'period',
          'year',
          'created_at',
          'student',
        ],
      }) as Promise<DisbursementWithStudent[]>,
      this.financesService.getFundsForAccount(whereClause),
    ]);

    const combinedData: AccountingRow[] = [
      ...budgets.map((b) => ({
        id: b.id,
        type: 'budget' as const,
        amount: b.total,
        description: `Budget for ${b.period} ${b.year}`,
        date: b.created_at,
        runningTotal: 0,
        period: b.period,
        year: b.year,
      })),
      ...disbursements.map((d) => ({
        id: d.id,
        type: 'disbursement' as const,
        amount: -d.amount, // negative for subtraction
        description: d.__student__
          ? `Disbursement to ${d.__student__?.name}`
          : `Disbursement: ${d.title}`,
        date: d.created_at,
        runningTotal: 0,
        period: d.period,
        year: d.year,
      })),
      ...funds.map((f) => ({
        id: f.id,
        type: 'fund' as const,
        amount: f.amount,
        description: `Fund: ${f.title}`,
        date: f.created_at,
        runningTotal: 0,
        period: f.period,
        year: f.year,
      })),
    ];

    // Sort by creation date
    combinedData.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate running total
    let runningTotal = 0;
    for (const row of combinedData) {
      if (row.type !== 'budget') {
        runningTotal += row.amount;
      }
      row.runningTotal = runningTotal;
    }

    return {
      accounting: combinedData,
      runningTotal,
    };
  }
}
