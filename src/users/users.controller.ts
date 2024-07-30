import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { IPagination, IResponse } from '../shared/response.interface';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { Roles } from '../authentication/guards/roles/roles.decorator';
import { AddUserDto } from './dto/create-user.dto';
import { RolesGuard } from '../authentication/guards/roles/roles.guard';
import { statusesTypes, userTypes } from './user.interface';
import { ChangeNameDto, ChangePasswordDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UsePipes(new ValidationPipe())
  @Roles(['super admin'])
  @Get('get-users')
  async getUsers(
    @Query('page') page: number,
    @Query('searchTerm') searchTerm: string,
    @Query('status') status: statusesTypes | '',
    @Query('role') role: userTypes | '',
  ): Promise<IResponse<IPagination<User[]>>> {
    return this.usersService.getUsers(page, searchTerm, status, role);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin'])
  @Post('invite')
  async addUser(@Body() addUserDto: AddUserDto): Promise<IResponse<User>> {
    return this.usersService.inviteUser(addUserDto);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin'])
  @Post('edit/:id')
  async editUser(
    @Param('id') id: string,
    @Body() editUserDto: AddUserDto,
  ): Promise<IResponse<User>> {
    return this.usersService.editUser(id, editUserDto);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin'])
  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<IResponse<User>> {
    return this.usersService.deleteUser(id);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin'])
  @Get('status/:id')
  async changeStatus(@Param('id') id: string): Promise<IResponse<User>> {
    return this.usersService.changeStatus(id);
  }

  @UsePipes(new ValidationPipe())
  @Patch('change-password/:id')
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<IResponse<User>> {
    return this.usersService.changePassword(id, changePasswordDto);
  }

  @UsePipes(new ValidationPipe())
  @Patch('change-name/:id')
  async changeName(
    @Param('id') id: string,
    @Body() changeNameDto: ChangeNameDto,
  ): Promise<IResponse<User>> {
    return this.usersService.changeName(id, changeNameDto);
  }
}
