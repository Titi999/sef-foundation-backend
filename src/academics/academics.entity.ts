import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Student } from '../students/student.entity';
import { terms } from './academics.interface';

@Entity({ name: 'academics' })
export class Academic {
  constructor() {
    this.id = uuidv4(); // You'll need to keep the uuid import for this
  }

  @PrimaryColumn('uuid')
  id: string;

  @ManyToOne(() => Student, { eager: true })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  course: string;

  @Column()
  grade: string;

  @Column()
  score: number;

  @Column({ enum: terms })
  term: string;

  @Column({ nullable: true })
  remarks: string;

  @Column()
  year: number;

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
