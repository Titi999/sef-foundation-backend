import {
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsUUID,
  Length,
} from 'class-validator';

export class VerifyLoginDto {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsNotEmpty()
  @IsNumberString()
  @Length(6, 6)
  token: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
