import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { IsEmail } from 'class-validator';
import { statuses, userRoles } from '../user.interface';
import { v4 as uuidv4 } from 'uuid';

@Entity({ name: 'users' })
export class User {
  constructor() {
    this.id = uuidv4(); // You'll need to keep the uuid import for this
  }

  @PrimaryColumn('uuid')
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

  @Column({ enum: [statuses], default: statuses[0] })
  status: string;

  @Column({ nullable: true })
  permissions: string;

  @Column({ nullable: true })
  remember_token: string;

  @Column({ nullable: true })
  email_verified_at: Date;

  @Column({ default: true })
  firstLogin: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  deactivated_at: Date;

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
