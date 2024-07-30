import { Column, Entity, JoinColumn, OneToMany, PrimaryColumn } from 'typeorm';
import { statuses } from '../users/user.interface';
import { Student } from '../students/student.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity({ name: 'schools' })
export class School {
  constructor() {
    this.id = uuidv4(); // You'll need to keep the uuid import for this
  }

  @PrimaryColumn('uuid')
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
