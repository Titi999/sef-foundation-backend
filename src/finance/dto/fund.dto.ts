import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FundDto {
  @IsString()
  period: string;

  @IsString()
  title: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  year: number;

  @IsOptional()
  @IsString()
  comments: string;
}
