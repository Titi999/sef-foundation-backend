import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity({ name: 'funds' })
export class Fund {
  constructor() {
    this.id = uuidv4();
  }

  @PrimaryColumn('uuid')
  id: string;

  @Column()
  period: string;

  @Column()
  title: string;

  @Column()
  amount: number;

  @Column()
  year: number;

  @Column({ nullable: true })
  comments: string;

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
