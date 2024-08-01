import { IsNotEmpty, IsOptional } from 'class-validator';
import { Terms } from './academics.interface';

// export class BeneficiaryAcademicsDto {
//   @IsNotEmpty()
//   totalScore: number;
//
//   @IsNotEmpty()
//   courses: number;
//
//   @IsNotEmpty()
//   term: termsType;
//
//   @IsOptional()
//   remarks: string;
//
//   @IsNotEmpty()
//   year: number;
// }

export class AcademicsDto {
  @IsNotEmpty()
  course: string;

  @IsNotEmpty()
  score: number;

  @IsNotEmpty()
  term: Terms;

  @IsNotEmpty()
  year: number;

  @IsOptional()
  remarks: string;
}
