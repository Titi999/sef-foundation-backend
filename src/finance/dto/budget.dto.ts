import { IsNumber, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateBudgetDto {
  @IsNumber()
  total: number;

  @IsNotEmpty()
  startDate: Date;

  @IsNotEmpty()
  endDate: Date;

  @IsNotEmpty()
  distributions: CreateBudgetDistributionDto[];
}

export class CreateBudgetDistributionDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsBoolean()
  boardingHouse: boolean;

  @IsOptional()
  comments: string;
}
