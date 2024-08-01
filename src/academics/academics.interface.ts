import { IPagination } from '../shared/response.interface';

export enum Terms {
  first = 'first',
  second = 'second',
  third = 'third',
}

export const terms = [Terms.first, Terms.second, Terms.third] as const;

export type termsType = (typeof terms)[number];

export interface AcademicPerformance {
  averageScore: string;
  grade: string;
  schoolName: string;
  studentId: string;
  studentName: string;
}

export interface AcademicPerformanceWithRanks {
  performanceRank: AcademicPerformance[];
  academicPerformance: IPagination<AcademicPerformance[]>;
}
