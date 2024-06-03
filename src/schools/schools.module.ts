import { Module } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { SchoolsController } from './schools.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { School } from './school.entity';

@Module({
  imports: [TypeOrmModule.forFeature([School])],
  providers: [SchoolsService],
  controllers: [SchoolsController],
})
export class SchoolsModule {}
