import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Budget } from './budget.entity';

@Entity({ name: 'otherBudgetDistributions' })
export class OtherBudgetDistribution {
  constructor() {
    this.id = uuidv4();
  }

  @PrimaryColumn('uuid')
  id: string;

  @ManyToOne(() => Budget, { lazy: true })
  @JoinColumn({ name: 'budgetId' })
  budget: Budget;

  @Column()
  title: string;

  @Column()
  amount: number;

  @Column({ nullable: true })
  comment: string;

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
