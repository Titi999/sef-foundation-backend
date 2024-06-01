import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Student } from '../../students/student.entity';
import { Budget } from './budget.entity';
import { DisbursementDistribution } from './disbursementDistribution.entity';
import { disbursementStatuses } from '../../users/user.interface';

@Entity({ name: 'disbursements' })
export class Disbursement {
  constructor() {
    // Generate a UUID for the new user instance
    this.id = uuidv4();
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, { lazy: true })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @ManyToOne(() => Budget, { lazy: true })
  @JoinColumn({ name: 'budgetId' })
  budget: Budget;

  @OneToMany(
    () => DisbursementDistribution,
    (disbursementDistribution) => disbursementDistribution.disbursement,
    {
      eager: true,
    },
  )
  @JoinColumn()
  disbursementDistribution: DisbursementDistribution[];

  @Column({ enum: disbursementStatuses, default: disbursementStatuses[0] })
  status: string;

  @Column()
  amount: number;

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
