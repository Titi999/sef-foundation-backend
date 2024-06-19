import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSchoolDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  email: string;

  @IsOptional()
  phone: string;

  @IsOptional()
  location: string;

  @IsNotEmpty()
  classes: string[];
}
