import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class OtherBudgetDistributionDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  comment: string;
}
