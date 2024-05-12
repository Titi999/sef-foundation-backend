import { Injectable } from '@nestjs/common';
import { Seeder } from 'typeorm-extension';
import * as process from 'process';
import * as bcrypt from 'bcrypt';
import { userRoles } from '../../users/user.interface';
import { User } from '../../users/entities/user.entity';
import { dataSource } from '../data-source';

@Injectable()
export class SuperAdminSeeder implements Seeder {
  async run() {
    // await dataSource.query('TRUNCATE "user" RESTART IDENTITY;');
    await dataSource.initialize();
    const repository = dataSource.getRepository(User);
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(
      process.env.SUPER_ADMIN_PASSWORD,
      salt,
    );
    await repository.insert({
      email: process.env.SUPER_ADMIN_EMAIL,
      name: process.env.SUPER_ADMIN_NAME,
      password: hashedPassword,
      role: userRoles[0],
      email_verified_at: new Date(),
    });
  }
}
