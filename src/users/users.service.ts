import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AddUserDto, CreateUserDto } from './dto/create-user.dto';
import { IPagination, IResponse } from '../shared/response.interface';
import { generateRandomToken } from '../utility/tokenGenerator';
import * as process from 'process';
import { NotificationService } from '../shared/notification/notification.service';
import { statusesTypes, userTypes } from './user.interface';
import { ChangeNameDto, ChangePasswordDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationService: NotificationService,
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
    const user = await this.findUserIncludingPasswordByEmail(email);
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

  async getUsers(
    page: number = 1,
    searchTerm: string = '',
    status: statusesTypes | '',
    role: userTypes | '',
  ): Promise<IResponse<IPagination<User[]>>> {
    const skip = (page - 1) * 10;
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (searchTerm) {
      queryBuilder.where('LOWER(user.name) LIKE LOWER(:searchTerm)', {
        searchTerm: `%${searchTerm}%`,
      });
      queryBuilder.orWhere('LOWER(user.email) LIKE LOWER(:searchTerm)', {
        searchTerm: `%${searchTerm}%`,
      });
    }

    if (status) {
      queryBuilder.where('LOWER(user.status) = LOWER(:status)', {
        status,
      });
    }

    if (role) {
      queryBuilder.where('LOWER(user.role) = LOWER(:role)', {
        role,
      });
    }

    const [users, total] = await queryBuilder
      .skip(skip)
      .take(10)
      .getManyAndCount();

    return {
      message: 'Users loaded successfully',
      data: {
        total,
        currentPage: page,
        totalPages: Math.ceil(total / 10),
        items: users,
      },
    };
  }

  async inviteUser(addUserDto: AddUserDto): Promise<IResponse<User>> {
    if (await this.findByEmail(addUserDto.email))
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: 'User with email already exists',
        },
        HttpStatus.CONFLICT,
      );

    const user = new User();
    user.email = addUserDto.email;
    user.name = addUserDto.name;
    const salt = await bcrypt.genSalt();
    const password = generateRandomToken(8);
    user.password = await bcrypt.hash(password, salt);
    user.role = addUserDto.role;
    const userResponse = await this.userRepository.save(user);
    await this.notificationService.sendInviteEmail(
      user.email,
      user.name,
      `${process.env.FRONTEND_URL}/login`,
      password,
    );
    return {
      message: 'User has been successfully invited via email',
      data: userResponse,
    };
  }

  async editUser(
    id: string,
    editUserDto: AddUserDto,
  ): Promise<IResponse<User>> {
    const user = await this.userRepository.findOneByOrFail({
      id,
    });
    user.email = editUserDto.email;
    user.role = editUserDto.role;
    user.name = editUserDto.name;
    const userResponse = await this.userRepository.save(user);

    return {
      message: 'User has been edited successfully',
      data: userResponse,
    };
  }

  async deleteUser(id: string): Promise<IResponse<User>> {
    const user = await this.userRepository.findOneByOrFail({
      id,
    });
    await this.userRepository.remove(user);
    return {
      message: 'User has been deleted successfully',
      data: user,
    };
  }

  async changeStatus(id: string): Promise<IResponse<User>> {
    const user = await this.userRepository.findOneByOrFail({
      id,
    });

    user.status = user.status === 'active' ? 'inactive' : 'active';
    const userResponse = await this.userRepository.save(user);
    return {
      message: 'User status has been updated successfully',
      data: userResponse,
    };
  }

  async findUserByRole(id: string, role: userTypes) {
    return this.userRepository.findOneBy({
      id,
      role,
    });
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.userRepository.findOneByOrFail({ id });
    const validate = await this.validateUser(
      user.email,
      changePasswordDto.password,
    );
    if (!validate) {
      throw new UnauthorizedException('Invalid old password');
    }

    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'New Password and confirm password do not match',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(changePasswordDto.password, salt);
    await this.userRepository.save(user);

    return {
      message: 'User password change successfully',
      data: user,
    };
  }

  public async changeName(
    id: string,
    { name }: ChangeNameDto,
  ): Promise<IResponse<User>> {
    const user = await this.userRepository.findOneByOrFail({ id });
    user.name = name;
    await this.userRepository.save(user);

    return {
      message: 'User name changed successfully',
      data: user,
    };
  }
}
