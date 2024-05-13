import {
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsStrongPassword,
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

export class ResetPasswordDto {
  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1,
    },
    { always: true },
  )
  password: string;

  @IsNotEmpty()
  confirmPassword: string;
}

export class ResendCodeDto {
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
