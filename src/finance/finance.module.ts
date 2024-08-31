import { Module } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budget } from './entities/budget.entity';
import { BudgetDistribution } from './entities/budgetDistribution.entity';
import { Disbursement } from './entities/disbursement.entity';
import { Request } from './entities/request.entity';
import { StudentsService } from '../students/students.service';
import { Student } from '../students/student.entity';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { NotificationService } from '../shared/notification/notification.service';
import { SchoolsService } from '../schools/schools.service';
import { School } from '../schools/school.entity';
import { JwtService } from '@nestjs/jwt';
import { OtherBudgetDistribution } from './entities/other-budget-distribution.entity';
import { FinancesService } from './finances.service';
import { Fund } from './entities/fund.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Budget,
      BudgetDistribution,
      Disbursement,
      Request,
      Student,
      User,
      School,
      OtherBudgetDistribution,
      Fund,
    ]),
  ],
  providers: [
    FinanceService,
    StudentsService,
    UsersService,
    NotificationService,
    SchoolsService,
    JwtService,
    FinancesService,
  ],
  controllers: [FinanceController],
})
export class FinanceModule {}
