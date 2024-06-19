import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { statuses } from '../users/user.interface';
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

  @Column('text', {
    array: true,
    default: ['Level 100', 'Level 200', 'Level 300', 'Level 400'],
  })
  classes: string[];

  @OneToMany(() => Student, (student) => student.school, {
    lazy: true,
  })
  @JoinColumn()
  students: Student[];

  @Column({ enum: [statuses], default: statuses[0] })
  status: string;
}
