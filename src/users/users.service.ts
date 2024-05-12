import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOne(id: string): Promise<User> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async findOneOrFail(id: string): Promise<User> {
    return await this.userRepository.findOneOrFail({ where: { id } });
  }

  async findByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async validatePassword(
    password: string,
    userPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, userPassword);
  }

  async validateUser(email: string, password: string): Promise<unknown> {
    const user = await this.findByEmail(email);
    if (user && (await this.validatePassword(password, user.password))) {
      const { ...result } = user;
      return result;
    }
    return null;
  }

  async setUser(user: User, userInfo: CreateUserDto): Promise<void> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(userInfo.password, salt);
    user.name = userInfo.name;
    user.password = hashedPassword;
    user.role = userInfo.role;
    user.email = userInfo.email;
  }

  async findUserIncludingPasswordByEmail(email: string): Promise<User> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async saveUser(user: User): Promise<User> {
    return this.userRepository.save(user);
  }
}
