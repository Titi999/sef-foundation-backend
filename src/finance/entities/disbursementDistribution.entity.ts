import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Disbursement } from './disbursement.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity({ name: 'disbursementDistributions' })
export class DisbursementDistribution {
  constructor() {
    this.id = uuidv4(); // You'll need to keep the uuid import for this
  }

  @PrimaryColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  amount: number;

  @ManyToOne(() => Disbursement, { lazy: true, nullable: true })
  @JoinColumn({ name: 'disbursementId' })
  disbursement: Disbursement;

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
