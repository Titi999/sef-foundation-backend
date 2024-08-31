import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBeneficiaryDisbursemenDto {
  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  disbursementDistribution: CreateDisbursementDistributionDto[];
}

export class CreateDisbursementDto {
  @IsOptional()
  studentId: string;

  @IsOptional()
  title: string;

  @IsNotEmpty()
  @IsString()
  period: string;

  @IsNotEmpty()
  @IsNumber()
  year: number;

  @IsNotEmpty()
  @IsNumber()
  amount: number;
}

export class CreateDisbursementDistributionDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  comments: string;
}
