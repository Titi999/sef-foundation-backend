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
