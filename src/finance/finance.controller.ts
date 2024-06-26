import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Headers,
  Post,
  Query,
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
  IResponse,
} from '../shared/response.interface';
import { Budget } from './entities/budget.entity';
import { FinanceService } from './finance.service';
import { Roles } from '../authentication/guards/roles/roles.decorator';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles/roles.guard';
import { Disbursement } from './entities/disbursement.entity';
import {
  CreateBeneficiaryDisbursemenDto,
  CreateDisbursementDto,
} from './dto/disbursement.dto';
import { disbursementStatusesType } from '../users/user.interface';
import { JwtService } from '@nestjs/jwt';
import { IJwtPayload } from '../authentication/strategy/jwt.interface';

@Controller('finance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinanceController {
  constructor(
    private readonly financeService: FinanceService,
    private jwtService: JwtService,
  ) {}

  @UsePipes(new ValidationPipe())
  @Roles(['super admin'])
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
    @Query('status') status: string,
  ): Promise<IResponse<IPagination<Budget[]>>> {
    return this.financeService.getBudgets(page, status);
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
    @Query('search') search: string,
    @Query('status') status: string,
  ): Promise<IResponse<IPagination<Disbursement[]>>> {
    return this.financeService.getDisbursements(page, status, search);
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
    return await this.financeService.createDisbursement(createDisbursementDto);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin'])
  @Patch('disbursement/:id')
  async editDisbursement(
    @Param('id') id: string,
    @Body() createDisbursementDto: CreateDisbursementDto,
  ): Promise<IResponse<Disbursement>> {
    return await this.financeService.editDisbursement(
      id,
      createDisbursementDto,
    );
  }

  @UsePipes(new ValidationPipe())
  @Roles(['beneficiary'])
  @Patch('request/:userId/:disbursementId')
  async editBeneficiaryDisbursement(
    @Param('userId') userId: string,
    @Param('disbursementId') disbursementId: string,
    @Body() createDisbursementDto: CreateBeneficiaryDisbursemenDto,
  ): Promise<IResponse<Disbursement>> {
    return await this.financeService.editBeneficiaryDisbursement(
      disbursementId,
      userId,
      createDisbursementDto,
    );
  }

  @UsePipes(new ValidationPipe())
  @Roles(['beneficiary'])
  @Post('disbursement/:id')
  async createBeneficiaryDisbursement(
    @Param('id') id: string,
    @Body() createDisbursementDto: CreateBeneficiaryDisbursemenDto,
  ): Promise<IResponse<Disbursement>> {
    return await this.financeService.createBeneficiaryDisbursement(
      id,
      createDisbursementDto,
    );
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin'])
  @Get('disbursements/approve/:id')
  async approveDisbursement(
    @Param('id') id: string,
  ): Promise<IResponse<Disbursement>> {
    return this.financeService.approveDisbursement(id);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin'])
  @Get('disbursements/decline/:id')
  async declineDisbursement(
    @Param('id') id: string,
  ): Promise<IResponse<Disbursement>> {
    return this.financeService.declineDisbursement(id);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['beneficiary'])
  @Delete('disbursement/:id')
  async deleteDisbursementByBeneficiary(
    @Param('id') id: string,
    @Headers('authorization') authorizationHeader: any,
  ): Promise<IResponse<Disbursement>> {
    const token = authorizationHeader.split(' ')[1];
    const decoded = (await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_SECRET,
    })) as IJwtPayload;
    return this.financeService.deleteDisbursementByBeneficiary(decoded.sub, id);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin', 'admin'])
  @Get('statistics')
  async getOverviewStats(
    @Query('year') year: number,
  ): Promise<IResponse<IOverviewStatistics>> {
    return this.financeService.getOverviewStats(year);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['beneficiary'])
  @Get('statistics/:id')
  async getBeneficiaryOverviewStats(
    @Param('id') id: string,
    @Query('year') year: number,
  ): Promise<IResponse<IBeneficiaryOverviewStatistics>> {
    return this.financeService.getBeneficiaryOverviewStats(id, year);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin', 'admin'])
  @Get('report')
  async getFinancialReport(
    @Query('budget') budget: string,
  ): Promise<IResponse<FinanceReportInterface[]>> {
    return this.financeService.getFinancialReport(budget);
  }
}
