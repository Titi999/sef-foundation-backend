import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as process from 'process';
import { User } from '../users/entities/user.entity';
import { SeederOptions } from 'typeorm-extension';
import { Authentication } from '../authentication/entities/authentication.entity';
import { Student } from '../students/student.entity';

config();

export const dataSourceOptions: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: {
    rejectUnauthorized: false,
  },
  entities: [User, Authentication, Student],
  synchronize: true,
  seeds: ['dist/db/seeds/**/*{.ts,.js}'],
};

export const dataSource = new DataSource(dataSourceOptions);
