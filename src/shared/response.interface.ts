import { AccountingRow } from '../finance/finance.interface';

export interface IResponse<T> {
  message: string;
  data: T;
}

export interface IPagination<T> {
  total: number;
  currentPage: number;
  totalPages: number;
  items: T;
}

export interface IOverviewStatistics extends IOverviewStatisticsBase {
  studentsSupported: number;
  totalFunds: number;
}

export interface IBeneficiaryOverviewStatistics
  extends IOverviewStatisticsBase {
  totalRequests: number;
  pendingRequests: number;
}

export interface IChart {
  labels: string[];
  values: number[];
}

export interface IOverviewStatisticsBase {
  fundsAllocated: number;
  totalFundingDisbursed: IChart;
  fundingDistribution: IChart;
  fundsDisbursed: number;
}

export interface FinanceReportInterface {
  accounting: AccountingRow[];
  summaryChart: {
    fund: IChart;
    disbursements: IChart;
    budget: IChart;
  };
  runningTotal: number;
}

export interface IMonthTotal {
  month: string;
  total: number;
}

export interface ITitleAmount {
  title: string;
  amount: number;
}

export interface IStudentPerformanceRanks {
  student: string;
  totalDisbursement: number;
  school: string;
  level: string;
}

export interface IPerformance {
  studentPerformanceRank: IStudentPerformanceRanks[];
  studentTotalDisbursements: IPagination<IStudentPerformanceRanks[]>;
}
