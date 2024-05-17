import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { LoginDto } from '../users/dto/create-user.dto';
import { IResponse } from '../shared/response.interface';
import { IUser, IUserToken } from './authentication.interface';
import {
  ForgotPasswordDto,
  ResendCodeDto,
  ResetPasswordDto,
  VerifyLoginDto,
} from './authentication.dto';
import { User } from '../users/entities/user.entity';

@Controller('authentication')
export class AuthenticationController {
  constructor(private authService: AuthenticationService) {}

  @UsePipes(new ValidationPipe())
  @Post('login')
  async signIn(@Body() loginDto: LoginDto): Promise<IResponse<User>> {
    return this.authService.signIn(loginDto);
  }

  @UsePipes(new ValidationPipe())
  @Post('verify-login')
  async verifyLogin(
    @Body() verifyLoginDto: VerifyLoginDto,
  ): Promise<IResponse<IUserToken>> {
    return this.authService.verifyLogin(verifyLoginDto);
  }

  @UsePipes(new ValidationPipe())
  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<IResponse<User>> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @UsePipes(new ValidationPipe())
  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<IResponse<User>> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @UsePipes(new ValidationPipe())
  @Post('resend-code')
  async resendCode(
    @Body() resendCodeDto: ResendCodeDto,
  ): Promise<IResponse<IUser>> {
    return this.authService.resendCode(resendCodeDto);
  }
}
