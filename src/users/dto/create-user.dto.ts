import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

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

  @IsNotEmpty()
  role: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
