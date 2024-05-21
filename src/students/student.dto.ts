import { IsNotEmpty, IsOptional } from 'class-validator';
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class AddStudentDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  parent: string;

  @IsNotEmpty()
  school: string;

  @IsNotEmpty()
  level: string;

  @IsOptional()
  description: string;

  @IsNotEmpty()
  phone: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date;
}
