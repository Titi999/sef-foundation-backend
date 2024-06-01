import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateDisbursementDto {
  @IsNotEmpty()
  studentId: string;

  @IsNotEmpty()
  budgetId: string;

  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  disbursementDistribution: CreateDisbursementDistributionDto[];
}

export class CreateDisbursementDistributionDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
