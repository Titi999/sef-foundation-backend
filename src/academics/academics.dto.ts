import { IsNotEmpty, IsOptional } from 'class-validator';
import { termsType } from './academics.interface';

export class BeneficiaryAcademicsDto {
  @IsNotEmpty()
  averageScore: number;

  @IsNotEmpty()
  term: termsType;

  @IsOptional()
  remarks: string;

  @IsNotEmpty()
  year: number;
}

export class AcademicsDto extends BeneficiaryAcademicsDto {
  @IsNotEmpty()
  studentId: string;
}
