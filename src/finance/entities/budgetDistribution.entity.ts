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

@Entity({ name: 'budgetDistributions' })
export class BudgetDistribution {
  constructor() {
    this.id = uuidv4(); // You'll need to keep the uuid import for this
  }

  @PrimaryColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  amount: number;

  @Column({ nullable: true })
  comments: string;

  @Column({ default: false })
  boardingHouse: boolean;

  @ManyToOne(() => Budget, { lazy: true, nullable: true })
  @JoinColumn({ name: 'budgetId' })
  budget: Budget;

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
