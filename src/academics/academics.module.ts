import { Module } from '@nestjs/common';
import { AcademicsService } from './academics.service';
import { AcademicsController } from './academics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Academic } from './academics.entity';
import { StudentsService } from '../students/students.service';
import { Student } from '../students/student.entity';
import { UsersService } from '../users/users.service';
import { SchoolsService } from '../schools/schools.service';
import { User } from '../users/entities/user.entity';
import { NotificationService } from '../shared/notification/notification.service';
import { School } from '../schools/school.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Academic, Student, User, School])],
  controllers: [AcademicsController],
  providers: [
    AcademicsService,
    StudentsService,
    UsersService,
    SchoolsService,
    NotificationService,
  ],
  exports: [],
})
export class AcademicsModule {}
