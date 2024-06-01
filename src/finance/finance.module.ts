import { Module } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budget } from './entities/budget.entity';
import { BudgetDistribution } from './entities/budgetDistribution.entity';
import { Disbursement } from './entities/disbursement.entity';
import { DisbursementDistribution } from './entities/disbursementDistribution.entity';
import { StudentsService } from '../students/students.service';
import { Student } from '../students/student.entity';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { NotificationService } from '../shared/notification/notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Budget,
      BudgetDistribution,
      Disbursement,
      DisbursementDistribution,
      Student,
      User,
    ]),
  ],
  providers: [
    FinanceService,
    StudentsService,
    UsersService,
    NotificationService,
  ],
  controllers: [FinanceController],
})
export class FinanceModule {}
