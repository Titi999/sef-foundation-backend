import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './student.entity';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { NotificationService } from '../shared/notification/notification.service';
import { SchoolsService } from '../schools/schools.service';
import { School } from '../schools/school.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, User, School])],
  controllers: [StudentsController],
  providers: [
    StudentsService,
    UsersService,
    NotificationService,
    SchoolsService,
  ],
  exports: [TypeOrmModule],
})
export class StudentsModule {}
