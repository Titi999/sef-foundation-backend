import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { LoginDto } from '../users/dto/create-user.dto';
import { IResponse } from '../shared/response.interface';
import { IUser, IUserToken, LoginResponse } from './authentication.interface';
import {
  ForgotPasswordDto,
  RefreshTokenDto,
  ResendCodeDto,
  ResetPasswordDto,
  VerifyLoginDto,
} from './authentication.dto';
import { User } from '../users/entities/user.entity';
import { JwtRefreshTokenGuard } from './guards/jwt-refresh-token.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('authentication')
export class AuthenticationController {
  constructor(private authService: AuthenticationService) {}

  @UsePipes(new ValidationPipe())
  @Post('login')
  async signIn(@Body() loginDto: LoginDto): Promise<IResponse<LoginResponse>> {
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

  @UseGuards(JwtRefreshTokenGuard)
  @Post('refresh-token')
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<{ data: { accessToken: string } }> {
    return this.authService.refreshAccessToken(refreshTokenDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('invalidate-token')
  async invalidateToken(@Req() request: Request): Promise<{ message: string }> {
    const authorizationHeader = request.headers.authorization;
    const token = authorizationHeader.split(' ')[1];
    await this.authService.invalidateToken(token);
    return { message: 'Token invalidated successfully' };
  }
}
