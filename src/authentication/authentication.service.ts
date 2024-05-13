import {
  BadRequestException,
  GoneException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenIdsStorage } from './refresh-token-ids-storage';
import { JwtRefreshTokenStrategy } from './strategy/jwt-refresh-token.strategy';
import { IResponse } from '../shared/response.interface';
import { LoginDto } from '../users/dto/create-user.dto';
import {
  IUser,
  IUserToken,
  verificationTypes,
} from './authentication.interface';
import { Authentication } from './entities/authentication.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  generateOTPCode,
  generateRandomToken,
} from '../utility/tokenGenerator';
import {
  ForgotPasswordDto,
  ResendCodeDto,
  ResetPasswordDto,
  VerifyLoginDto,
} from './authentication.dto';
import { NotificationService } from '../shared/notification/notification.service';
import * as process from 'process';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(JwtRefreshTokenStrategy.name);
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private refreshTokenIdsStorage: RefreshTokenIdsStorage,
    @InjectRepository(Authentication)
    private readonly authenticationRepository: Repository<Authentication>,
    private readonly notificationService: NotificationService,
  ) {}

  async signIn(loginDto: LoginDto): Promise<IResponse<IUser>> {
    const { email, password } = loginDto;

    const user =
      await this.usersService.findUserIncludingPasswordByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordIsValid = await this.usersService.validatePassword(
      password,
      user.password,
    );

    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const authentication = new Authentication();
    authentication.user = user;
    authentication.token = generateOTPCode();
    authentication.type = verificationTypes[1];
    await this.notificationService.sendLoginVerificationEmail(
      user.email,
      user.name,
      authentication.token,
    );
    await this.authenticationRepository.save(authentication);
    delete user.password;
    return {
      message: 'An OTP has been sent to your email for verification',
      data: {
        user,
      },
    };
  }

  async verifyLogin(
    verifyLoginDto: VerifyLoginDto,
  ): Promise<IResponse<IUserToken>> {
    const user = await this.usersService.findOneOrFail(verifyLoginDto.id);
    const authentication = await this.authenticationRepository.findOneByOrFail({
      type: verificationTypes[1],
      token: verifyLoginDto.token,
    });
    const createdAt = new Date(authentication.created_at).getMinutes();
    const now = new Date().getMinutes();

    const differenceInMinutes = now - createdAt;

    if (differenceInMinutes > 10) {
      throw new GoneException({
        message: 'OTP has expired. Please try again',
        status: 410,
      });
    }
    await this.authenticationRepository.delete(authentication);
    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1d',
    });

    // Store the refresh token in redis
    await this.refreshTokenIdsStorage.insert(user.id, refreshToken);

    return {
      message: 'You have successfully logged in',
      data: {
        accessToken: accessToken,
        refreshToken: refreshToken,
        user: user,
      },
    };
  }

  async forgotPassword({ email }: ForgotPasswordDto): Promise<IResponse<User>> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} does not exist`);
    }

    const authentication = new Authentication();
    const token = generateRandomToken();
    authentication.token = token;
    authentication.user = user;
    authentication.type = verificationTypes[0];
    await this.authenticationRepository.save(authentication);
    const resetLink = `reset-password/${token}`;
    await this.notificationService.sendForgotPasswordEmail(
      user.email,
      user.name,
      `${process.env.FRONTEND_URL}/${resetLink}`,
    );
    return {
      message: `We have sent a reset email to ${user.email}`,
      data: user,
    };
  }

  async resetPassword({
    token,
    confirmPassword,
    password,
  }: ResetPasswordDto): Promise<IResponse<User>> {
    const authentication = await this.authenticationRepository.findOneByOrFail({
      token,
    });
    const createdAt = new Date(authentication.created_at).getMinutes();
    const now = new Date().getMinutes();

    const differenceInMinutes = now - createdAt;

    if (differenceInMinutes > 10) {
      throw new GoneException({
        message: 'The request for reset has expired. Please try again',
        status: 410,
      });
    }

    if (password !== confirmPassword) {
      throw new BadRequestException({
        message: 'Confirm password and password do not match',
        status: 400,
      });
    }

    const user = await this.usersService.findOne(authentication.user.id);

    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(password, salt);
    await this.usersService.saveUser(user);
    await this.authenticationRepository.delete(authentication);
    return {
      message: `You have successfully reset your password`,
      data: user,
    };
  }

  async resendCode({ id }: ResendCodeDto) {
    const user = await this.usersService.findOneOrFail(id);
    const authentications = await this.authenticationRepository.find({
      where: {
        user: {
          id: user.id,
        },
        type: verificationTypes[1],
      },
    });
    let recentVerification = false;
    for (const authentication of authentications) {
      const now = new Date().getMinutes();
      const createdAt = authentication.created_at.getMinutes();
      const differenceInMinutes = now - createdAt;
      if (differenceInMinutes <= 10) {
        recentVerification = true;
      }
      await this.authenticationRepository.remove(authentication);
    }

    if (!recentVerification) {
      throw new GoneException(
        'Period to resend code has elapsed. Please login again',
      );
    }

    const newAuthentication = new Authentication();
    newAuthentication.user = user;
    newAuthentication.token = generateOTPCode();
    newAuthentication.type = verificationTypes[1];
    await this.notificationService.sendLoginVerificationEmail(
      user.email,
      user.name,
      newAuthentication.token,
    );
    await this.authenticationRepository.save(newAuthentication);

    return {
      message: 'An new OTP has been sent to your email for verification',
      data: {
        user,
      },
    };
  }
}
