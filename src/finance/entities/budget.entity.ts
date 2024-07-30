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

@Entity({ name: 'budgets' })
export class Budget {
  constructor() {
    this.id = uuidv4(); // You'll need to keep the uuid import for this
  }

  @PrimaryColumn('uuid')
  id: string;

  @Column()
  total: number;

  @Column()
  utilized: number;

  @Column()
  surplus: number;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @OneToMany(
    () => BudgetDistribution,
    (budgetDistribution) => budgetDistribution.budget,
    {
      eager: true,
    },
  )
  @JoinColumn()
  budgetDistribution: BudgetDistribution[];

  @Column()
  totalDistribution: number;

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
