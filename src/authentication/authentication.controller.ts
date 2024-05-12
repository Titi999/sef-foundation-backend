import { Body, Controller, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { LoginDto } from '../users/dto/create-user.dto';
import { IResponse } from '../shared/response.interface';
import { IUser, IUserToken } from './authentication.interface';
import { VerifyLoginDto } from './authentication.dto';

@Controller('authentication')
export class AuthenticationController {
  constructor(private authService: AuthenticationService) {}

  @Post('login')
  async signIn(@Body() loginDto: LoginDto): Promise<IResponse<IUser>> {
    return this.authService.signIn(loginDto);
  }

  @Post('verify-login')
  async verifyLogin(
    @Body() verifyLoginDto: VerifyLoginDto,
  ): Promise<IResponse<IUserToken>> {
    return this.authService.verifyLogin(verifyLoginDto);
  }
}
