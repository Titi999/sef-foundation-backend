import { IsNumber, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateBudgetDto {
  @IsNotEmpty()
  period: string;

  @IsNotEmpty()
  year: number;
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
