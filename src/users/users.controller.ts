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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { IPagination, IResponse } from '../shared/response.interface';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { Roles } from '../authentication/guards/roles/roles.decorator';
import { AddUserDto } from './dto/create-user.dto';
import { RolesGuard } from '../authentication/guards/roles/roles.guard';
import { statusesTypes, userTypes } from './user.interface';
import { ChangePasswordDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(['super admin'])
  @Get()
  async getUsers(
    @Query('page') page: number,
    @Query('searchTerm') searchTerm: string,
    @Query('status') status: statusesTypes | '',
    @Query('role') role: userTypes | '',
  ): Promise<IResponse<IPagination<User[]>>> {
    return this.usersService.getUsers(page, searchTerm, status, role);
  }

  @Roles(['super admin'])
  @Post('invite')
  async addUser(@Body() addUserDto: AddUserDto): Promise<IResponse<User>> {
    return this.usersService.inviteUser(addUserDto);
  }

  @Roles(['super admin'])
  @Post('edit/:id')
  async editUser(
    @Param('id') id: string,
    @Body() editUserDto: AddUserDto,
  ): Promise<IResponse<User>> {
    return this.usersService.editUser(id, editUserDto);
  }

  @Roles(['super admin'])
  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<IResponse<User>> {
    return this.usersService.deleteUser(id);
  }

  @Roles(['super admin'])
  @Get('status/:id')
  async changeStatus(@Param('id') id: string): Promise<IResponse<User>> {
    return this.usersService.changeStatus(id);
  }

  @Patch('change-password/:id')
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<IResponse<User>> {
    return this.usersService.changePassword(id, changePasswordDto);
  }
}
