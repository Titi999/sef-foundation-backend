import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './student.entity';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { NotificationService } from '../shared/notification/notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([Student, User])],
  controllers: [StudentsController],
  providers: [StudentsService, UsersService, NotificationService],
  exports: [TypeOrmModule],
})
export class StudentsModule {}
