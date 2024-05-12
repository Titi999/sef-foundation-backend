import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';
import { IsEmail } from 'class-validator';
import { userRoles } from '../user.interface';

@Entity({ name: 'users' })
export class User {
  constructor() {
    // Generate a UUID for the new user instance
    this.id = uuidv4();
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsEmail()
  @Unique(['email'])
  email: string;

  @Column()
  name: string;

  @Column({ select: false })
  @Exclude()
  password: string;

  @Column({ enum: userRoles })
  role: string;

  @Column({ nullable: true })
  permissions: string;

  @Column({ nullable: true })
  remember_token: string;

  @Column({ nullable: true })
  email_verified_at: Date;

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
