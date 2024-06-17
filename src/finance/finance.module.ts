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
import { SchoolsService } from '../schools/schools.service';
import { School } from '../schools/school.entity';
import { AuthenticationService } from '../authentication/authentication.service';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenIdsStorage } from '../authentication/refresh-token-ids-storage';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Budget,
      BudgetDistribution,
      Disbursement,
      DisbursementDistribution,
      Student,
      User,
      School,
    ]),
  ],
  providers: [
    FinanceService,
    StudentsService,
    UsersService,
    NotificationService,
    SchoolsService,
    JwtService,
  ],
  controllers: [FinanceController],
})
export class FinanceModule {}
