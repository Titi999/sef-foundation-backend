import { BudgetDistribution } from './entities/budgetDistribution.entity';
import { Budget } from './entities/budget.entity';
import { OtherBudgetDistribution } from './entities/other-budget-distribution.entity';

export interface BudgetDetails {
  budget: Budget;
  budgetDistribution: BudgetDistribution[];
  splitDetails: {
    labels: string[];
    values: number[];
  };
  otherBudgetDistribution: OtherBudgetDistribution[];
}

export interface AccountingRow {
  id: string;
  type: 'budget' | 'disbursement' | 'fund';
  amount: number;
  description: string;
  date: Date;
  runningTotal: number;
  period: string;
  year: number;
}
