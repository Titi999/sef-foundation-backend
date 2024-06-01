import { Module } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budget } from './entities/budget.entity';
import { BudgetDistribution } from './entities/budgetDistribution.entity';
import { Disbursement } from './entities/disbursement.entity';
import { DisbursementDistribution } from './entities/disbursementDistribution.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Budget,
      BudgetDistribution,
      Disbursement,
      DisbursementDistribution,
    ]),
  ],
  providers: [FinanceService],
  controllers: [FinanceController],
})
export class FinanceModule {}
