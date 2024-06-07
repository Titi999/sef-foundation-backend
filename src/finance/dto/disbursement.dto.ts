import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateBeneficiaryDisbursemenDto {
  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  disbursementDistribution: CreateDisbursementDistributionDto[];
}

export class CreateDisbursementDto extends CreateBeneficiaryDisbursemenDto {
  @IsNotEmpty()
  studentId: string;
}

export class CreateDisbursementDistributionDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
