import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateBudgetDto } from './dto/budget.dto';
import {
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
import { CreateDisbursementDto } from './dto/disbursement.dto';

@Controller('finance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

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
  ): Promise<IResponse<IPagination<Budget[]>>> {
    return this.financeService.getBudgets(page);
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
  @Patch('budget')
  async editBudget(
    @Param('id') id: string,
    @Body() createBudgetDto: CreateBudgetDto,
  ): Promise<IResponse<Budget>> {
    return this.financeService.editBudget(id, createBudgetDto);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin'])
  @Delete('budget')
  async deleteBudget(@Param('id') id: string): Promise<IResponse<Budget>> {
    return this.financeService.deleteBudget(id);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin'])
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
  ): Promise<IResponse<IPagination<Disbursement[]>>> {
    return this.financeService.getDisbursements(page);
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
  @Roles(['super admin', 'admin'])
  @Get('statistics')
  async getOverviewStats(
    @Query('year') year: number,
  ): Promise<IResponse<IOverviewStatistics>> {
    return this.financeService.getOverviewStats(year);
  }
}
