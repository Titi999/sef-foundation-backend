import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BudgetDistribution } from './budgetDistribution.entity';
import { statuses } from '../../users/user.interface';
import { v4 as uuidv4 } from 'uuid';
import { OtherBudgetDistribution } from './other-budget-distribution.entity';

@Entity({ name: 'budgets' })
export class Budget {
  constructor() {
    this.id = uuidv4();
  }

  @PrimaryColumn('uuid')
  id: string;

  @Column()
  total: number;

  @Column()
  year: number;

  @Column()
  period: string;

  @OneToMany(
    () => BudgetDistribution,
    (budgetDistribution) => budgetDistribution.budget,
  )
  @JoinColumn()
  budgetDistribution: BudgetDistribution[];

  @OneToMany(
    () => OtherBudgetDistribution,
    (otherBudgetDistribution) => otherBudgetDistribution.budget,
  )
  @JoinColumn()
  otherBudgetDistribution: OtherBudgetDistribution[];

  @Column({ enum: [statuses], default: statuses[0] })
  status: string;

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
