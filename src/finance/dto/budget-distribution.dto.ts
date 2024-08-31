import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class DistributionDto {
  @IsString()
  school: string;

  @IsString()
  class: string;

  @IsNumber()
  tuition: number;

  @IsNumber()
  textBooks: number;

  @IsNumber()
  extraClasses: number;

  @IsNumber()
  examFee: number;

  @IsNumber()
  homeCare: number;

  @IsNumber()
  uniformBag: number;

  @IsNumber()
  excursion: number;

  @IsNumber()
  transportation: number;

  @IsNumber()
  wears: number;

  @IsNumber()
  schoolFeeding: number;

  @IsNumber()
  stationery: number;

  @IsNumber()
  provision: number;
}

export class BudgetDistributionDto extends DistributionDto {
  @IsNotEmpty()
  studentCode: string;
}

export class RequestDto extends DistributionDto {
  @IsNotEmpty()
  budgetId: string;
}
