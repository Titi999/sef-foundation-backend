import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateBudgetDto } from './dto/budget.dto';
import {
  FinanceReportInterface,
  IBeneficiaryOverviewStatistics,
  IOverviewStatistics,
  IPagination,
  IPerformance,
  IResponse,
} from '../shared/response.interface';
import { Budget } from './entities/budget.entity';
import { FinanceService } from './finance.service';
import { Roles } from '../authentication/guards/roles/roles.decorator';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles/roles.guard';
import { Disbursement } from './entities/disbursement.entity';
import { CreateDisbursementDto } from './dto/disbursement.dto';
import { disbursementStatusesType } from '../users/user.interface';
import {
  BudgetDistributionDto,
  RequestDto,
} from './dto/budget-distribution.dto';
import { BudgetDistribution } from './entities/budgetDistribution.entity';
import { BudgetDetails } from './finance.interface';
import { FinancesService } from './finances.service';
import { OtherBudgetDistributionDto } from './dto/other-budget-distribution.dto';
import { OtherBudgetDistribution } from './entities/other-budget-distribution.entity';
import { FundDto } from './dto/fund.dto';
import { Fund } from './entities/fund.entity';
import { UpdateResult } from 'typeorm';
import { Request } from './entities/request.entity';
import { Request as ExpressRequest } from 'express';
import { User } from '../users/entities/user.entity';

@Controller('finance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinanceController {
  constructor(
    private readonly financeService: FinanceService,
    private readonly financesService: FinancesService,
  ) {}

  @UsePipes(new ValidationPipe())
  @Get('budgets/all')
  async getAllBudgets(): Promise<IResponse<Budget[]>> {
    return this.financeService.getAllBudgets();
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin'])
  @Get('budgets/:id')
  async getBudget(@Param('id') id: string): Promise<IResponse<Budget>> {
    return this.financeService.getBudget(id);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin'])
  @Get('budgets')
  async getBudgets(
    @Query('page') page: number,
    @Query('period') period: string,
    @Query('year') year: string,
  ): Promise<IResponse<IPagination<Budget[]>>> {
    return this.financeService.getBudgets(page, period, year);
  }

  @UsePipes(new ValidationPipe())
  @Get('requests')
  async getRequests(
    @Query('userId') userId: string,
    @Query('page') page: number,
    @Query('status') status: string,
  ): Promise<IResponse<IPagination<Request[]>>> {
    return this.financesService.getRequests(userId, page, status);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin'])
  @Get('budget-details/:id')
  async getBudgetDetails(
    @Param('id') id: string,
    @Query('search') search: string,
  ): Promise<IResponse<BudgetDetails>> {
    return this.financeService.getBudgetDetails(id, search);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin'])
  @Post('budget')
  async createBudget(
    @Body() createBudgetDto: CreateBudgetDto,
  ): Promise<IResponse<Budget>> {
    return this.financeService.createBudget(createBudgetDto);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin'])
  @Post('budget/:id')
  async createBudgetDistribution(
    @Body() createBudgetDistributions: BudgetDistributionDto[],
    @Param('id') id: string,
  ): Promise<IResponse<BudgetDistribution[]>> {
    return this.financeService.addBudgetDistribution(
      id,
      createBudgetDistributions,
    );
  }

  @UsePipes(new ValidationPipe())
  @Post('request')
  async createRequest(
    @Body() createRequest: RequestDto,
    @Req() req: ExpressRequest,
  ): Promise<IResponse<Request>> {
    const { id } = req.user as User;
    return this.financesService.addRequest(id, createRequest);
  }

  @UsePipes(new ValidationPipe())
  @Delete('request/:id')
  async deleteRequest(@Param('id') id: string): Promise<IResponse<Request>> {
    return this.financesService.deleteRequest(id);
  }

  @UsePipes(new ValidationPipe())
  @Patch('request/:id')
  async editRequest(
    @Body() createRequest: RequestDto,
    @Param('id') id: string,
  ): Promise<IResponse<Request>> {
    return this.financesService.editRequest(id, createRequest);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin'])
  @Get('request/approve/:id')
  async approveRequest(@Param('id') id: string): Promise<IResponse<Request>> {
    return this.financesService.approveRequest(id);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin'])
  @Get('request/decline/:id')
  async declineRequest(@Param('id') id: string): Promise<IResponse<Request>> {
    return this.financesService.declineRequest(id);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin'])
  @Post('other-budget/:id')
  async createOtherBudgetDistribution(
    @Body() otherBudgetDistributionDto: OtherBudgetDistributionDto,
    @Param('id') id: string,
  ): Promise<IResponse<OtherBudgetDistribution>> {
    return this.financesService.createOtherBudgetDistribution(
      id,
      otherBudgetDistributionDto,
    );
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin'])
  @Patch('budget/:id')
  async editBudget(
    @Param('id') id: string,
    @Body() createBudgetDto: CreateBudgetDto,
  ): Promise<IResponse<Budget>> {
    return this.financeService.editBudget(id, createBudgetDto);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin'])
  @Delete('budget/:id')
  async deleteBudget(@Param('id') id: string): Promise<IResponse<Budget>> {
    return this.financeService.deleteBudget(id);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin', 'beneficiary'])
  @Get('disbursement/:id')
  async getDisbursement(
    @Param('id') id: string,
  ): Promise<IResponse<Disbursement>> {
    return this.financeService.getDisbursement(id);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin'])
  @Get('disbursements')
  async getDisbursements(
    @Query('page') page: number,
    @Query('year') year: number,
    @Query('search') search: string,
    @Query('period') period: string,
  ): Promise<IResponse<IPagination<Disbursement[]>>> {
    return this.financeService.getDisbursements(page, search, year, period);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['beneficiary'])
  @Get('disbursements/:id')
  async getBeneficiaryDisbursements(
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('status') status: disbursementStatusesType,
  ): Promise<IResponse<IPagination<Disbursement[]>>> {
    return this.financeService.getBeneficiaryDisbursements(id, page, status);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin'])
  @Post('disbursement')
  async createDisbursement(
    @Body() createDisbursementDto: CreateDisbursementDto,
  ): Promise<IResponse<Disbursement>> {
    return await this.financesService.createDisbursement(createDisbursementDto);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin'])
  @Patch('disbursement/:id')
  async editDisbursement(
    @Param('id') id: string,
    @Body() createDisbursementDto: CreateDisbursementDto,
  ): Promise<IResponse<Disbursement>> {
    return await this.financesService.updateDisbursement(
      id,
      createDisbursementDto,
    );
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin'])
  @Delete('disbursement/:id')
  async deleteDisbursement(
    @Param('id') id: string,
  ): Promise<IResponse<Disbursement>> {
    return await this.financesService.deleteDisbursement(id);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin'])
  @Post('fund')
  async createFund(@Body() fundDto: FundDto): Promise<IResponse<Fund>> {
    return await this.financesService.createFund(fundDto);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin'])
  @Get('fund')
  async getFunds(
    @Query('page') page: number,
    @Query('period') period: string,
    @Query('year') year: number,
  ): Promise<IResponse<IPagination<Fund[]>>> {
    return await this.financesService.getFunds(page, period, year);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin'])
  @Patch('fund/:id')
  async editFunds(
    @Param('id') id: string,
    @Body() fundDto: FundDto,
  ): Promise<IResponse<UpdateResult>> {
    return await this.financesService.editFund(id, fundDto);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin'])
  @Delete('fund/:id')
  async deleteFunds(@Param('id') id: string): Promise<IResponse<Fund>> {
    return await this.financesService.deleteFund(id);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin', 'admin'])
  @Get('statistics')
  async getOverviewStats(
    @Query('year') year: number,
    @Query('period') period: string,
  ): Promise<IResponse<IOverviewStatistics>> {
    return this.financeService.getOverviewStats(year, period);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['beneficiary'])
  @Get('statistics/:id')
  async getBeneficiaryOverviewStats(
    @Param('id') id: string,
    @Query('year') year: number,
    @Query('period') period: string,
  ): Promise<IResponse<IBeneficiaryOverviewStatistics>> {
    return this.financeService.getBeneficiaryOverviewStats(id, period, year);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin', 'admin'])
  @Get('report')
  async getFinancialReport(
    @Query('period') period: string,
    @Query('year') year: number,
  ): Promise<IResponse<FinanceReportInterface>> {
    return this.financeService.getFinanceReport(period, year);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin', 'admin'])
  @Get('performance')
  async getPerformanceReport(
    @Query('page') page: number,
    @Query('search') search: string,
    @Query('type') type: string,
    @Query('year') year: number,
    @Query('category') category: string,
  ): Promise<IResponse<IPerformance>> {
    return this.financeService.getPerformanceReport(
      page,
      search,
      type,
      year,
      category,
    );
  }
}
