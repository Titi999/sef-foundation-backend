import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
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
}
