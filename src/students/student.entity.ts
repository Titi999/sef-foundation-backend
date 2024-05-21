import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../users/entities/user.entity';
import { statuses } from '../users/user.interface';

@Entity({ name: 'students' })
export class Student {
  constructor() {
    // Generate a UUID for the new user instance
    this.id = uuidv4();
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, {
    nullable: true,
  })
  @JoinColumn({ name: 'userId' })
  user?: User | null;

  @Column()
  @Unique(['name'])
  name: string;

  @Column()
  parent: string;

  @Column()
  school: string;

  @Column()
  level: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  @Unique(['phone'])
  phone: string;

  @Column({ nullable: true, enum: [statuses], default: 'active' })
  status: string;

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
