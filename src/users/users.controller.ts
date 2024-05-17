import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { IPagination, IResponse } from '../shared/response.interface';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { Roles } from '../authentication/guards/roles/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(['super admin'])
  @Get()
  async getUsers(
    @Query('page') page: number,
    @Query('searchTerm') searchTerm: string,
  ): Promise<IResponse<IPagination<User[]>>> {
    return this.usersService.getUsers(page, searchTerm);
  }
}
