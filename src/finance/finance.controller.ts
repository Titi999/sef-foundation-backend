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
import { IPagination, IResponse } from '../shared/response.interface';
import { Budget } from './entities/budget.entity';
import { FinanceService } from './finance.service';
import { Roles } from '../authentication/guards/roles/roles.decorator';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles/roles.guard';

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
}
