import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/entities/user.entity';
import { statuses } from '../users/user.interface';
import { Disbursement } from '../finance/entities/disbursement.entity';
import { School } from '../schools/school.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity({ name: 'students' })
export class Student {
  constructor() {
    this.id = uuidv4(); // You'll need to keep the uuid import for this
  }

  @PrimaryColumn('uuid')
  id: string;

  @Column({
    type: 'integer',
    unique: true,
  })
  @Generated('increment')
  code: number;

  @OneToOne(() => User, {
    nullable: true,
  })
  @JoinColumn({ name: 'userId' })
  user?: User | null;

  @Column({ default: false })
  boardingHouse: boolean;

  @Column()
  @Unique(['name'])
  name: string;

  @Column()
  parent: string;

  @Column({ nullable: true })
  grandParent: string;

  @Column({ nullable: true })
  greatGrandparent: string;

  @Column({ nullable: true })
  parentPhone: string;

  @ManyToOne(() => School, { eager: true })
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column()
  level: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  @Unique(['phone'])
  phone: string;

  @OneToMany(() => Disbursement, (disbursement) => disbursement.student, {
    eager: true,
  })
  @JoinColumn()
  disbursement: Disbursement[];

  @Column({ nullable: true, enum: statuses, default: 'active' })
  status: string;

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
