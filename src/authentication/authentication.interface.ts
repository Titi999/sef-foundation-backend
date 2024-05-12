import { User } from '../users/entities/user.entity';

export interface IUserToken {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface IUser {
  user: User;
}

export const verificationTypes = ['email', 'login'] as const;

export type verificationType = (typeof verificationTypes)[number];
