import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Student } from '../../students/student.entity';
import { v4 as uuidv4 } from 'uuid';

export interface DisbursementWithStudent extends Disbursement {
  __student__: Student | null;
}

@Entity({ name: 'disbursements' })
export class Disbursement {
  constructor() {
    this.id = uuidv4();
  }

  @PrimaryColumn('uuid')
  id: string;

  @ManyToOne(() => Student, { lazy: true })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ nullable: true })
  title: string;

  @Column()
  period: string;

  @Column()
  amount: number;

  @Column({ default: 2024 })
  year: number;

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
