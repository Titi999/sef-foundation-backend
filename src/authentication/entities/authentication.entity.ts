import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { verificationTypes } from '../authentication.interface';
import { v4 as uuidv4 } from 'uuid';

@Entity({ name: 'authentications' })
export class Authentication {
  constructor() {
    this.id = uuidv4(); // You'll need to keep the uuid import for this
  }

  @PrimaryColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    enum: verificationTypes,
  })
  type: string;

  @Column()
  token: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;
}
