import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { statuses } from '../users/user.interface';
import { DisbursementDistribution } from '../finance/entities/disbursementDistribution.entity';
import { Student } from '../students/student.entity';

@Entity({ name: 'schools' })
export class School {
  constructor() {
    // Generate a UUID for the new user instance
    this.id = uuidv4();
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  location: string;

  @OneToMany(() => Student, (student) => student.school, {
    lazy: true,
  })
  @JoinColumn()
  students: Student[];

  @Column({ enum: [statuses], default: statuses[0] })
  status: string;
}
