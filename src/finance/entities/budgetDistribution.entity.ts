import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Budget } from './budget.entity';
import { v4 as uuidv4 } from 'uuid';
import { Student } from '../../students/student.entity';

@Entity({ name: 'budgetDistributions' })
export class BudgetDistribution {
  constructor() {
    this.id = uuidv4();
  }

  @PrimaryColumn('uuid')
  id: string;

  @ManyToOne(() => Student, { lazy: true })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @ManyToOne(() => Budget, { lazy: true })
  @JoinColumn({ name: 'budgetId' })
  budget: Budget;

  @Column()
  school: string;

  @Column()
  class: string;

  @Column()
  tuition: number;

  @Column()
  textBooks: number;

  @Column()
  extraClasses: number;

  @Column()
  examFee: number;

  @Column()
  homeCare: number;

  @Column()
  uniformBag: number;

  @Column()
  excursion: number;

  @Column()
  transportation: number;

  @Column()
  wears: number;

  @Column()
  schoolFeeding: number;

  @Column()
  stationery: number;

  @Column()
  provision: number;

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
