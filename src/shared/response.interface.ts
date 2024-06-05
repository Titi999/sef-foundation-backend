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

export interface IOverviewStatistics {
  totalFundingDisbursed: IMonthTotal[];
  fundingDistribution: ITitleAmount[];
}

export interface IMonthTotal {
  month: string;
  total: number;
}

export interface ITitleAmount {
  title: string;
  amount: number;
}
