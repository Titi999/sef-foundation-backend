import { Module } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budget } from './entities/budget.entity';
import { BudgetDistribution } from './entities/budgetDistribution.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Budget, BudgetDistribution])],
  providers: [FinanceService],
  controllers: [FinanceController],
})
export class FinanceModule {}
