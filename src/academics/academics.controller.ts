import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Roles } from '../authentication/guards/roles/roles.decorator';
import { AcademicsService } from './academics.service';
import { AcademicsDto } from './academics.dto';
import { Academic } from './academics.entity';
import { IPagination, IResponse } from '../shared/response.interface';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles/roles.guard';
import { AcademicPerformanceWithRanks } from './academics.interface';

@Controller('academics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AcademicsController {
  constructor(private academicsService: AcademicsService) {}

  @UsePipes(new ValidationPipe())
  @Roles(['beneficiary'])
  @Post('create/:id')
  async createBeneficiaryAcademic(
    @Param('id') id: string,
    @Body() academicsDto: AcademicsDto,
  ): Promise<IResponse<Academic>> {
    return this.academicsService.createAcademic(academicsDto, id);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin', 'admin'])
  @Get('performances')
  async getAcademicsPerformance(
    @Query('page') page: number = 1,
    @Query('searchTerm') searchTerm: string = '',
    @Query('year') year: number,
    @Query('term') term: string,
  ): Promise<IResponse<AcademicPerformanceWithRanks>> {
    return this.academicsService.getPerformanceWithRanks(
      page,
      searchTerm,
      year,
      term,
    );
  }

  @UsePipes(new ValidationPipe())
  @Roles(['beneficiary'])
  @Get('performances/:id')
  async getBeneficiaryAcademics(
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('searchTerm') searchTerm: string = '',
    @Query('term') term: string = '',
    @Query('year') year: number,
  ): Promise<IResponse<IPagination<Academic[]>>> {
    return this.academicsService.getBeneficiaryAcademicsPerformance(
      id,
      page,
      searchTerm,
      term,
      year,
    );
  }

  @UsePipes(new ValidationPipe())
  @Roles(['beneficiary'])
  @Put('update/:userId/:id')
  async updateBeneficiaryAcademic(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() academicsDto: AcademicsDto,
  ): Promise<IResponse<Academic>> {
    return this.academicsService.updateAcademic(id, academicsDto, userId);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['beneficiary'])
  @Delete('delete/:userId/:academicId')
  async deleteBeneficiaryAcademic(
    @Param('userId') userId: string,
    @Param('academicId') academicId: string,
  ): Promise<IResponse<Academic>> {
    return this.academicsService.deleteAcademic(academicId, userId);
  }

  //This could probably be implemented in the future if we choose to allow admin
  //to perform crud operations on beneficiary academic records
  // @UsePipes(new ValidationPipe())
  // @Roles(['super admin', 'admin'])
  // @Put(':id')
  // async updateAcademic(
  //   @Param('id') id: string,
  //   @Body() academicsDto: AcademicsDto,
  // ): Promise<IResponse<Academic>> {
  //   return this.academicsService.updateAcademic(id, academicsDto);
  // }

  // @UsePipes(new ValidationPipe())
  // @Roles(['super admin', 'admin'])
  // @Delete(':id')
  // async deleteAcademic(@Param('id') id: string): Promise<IResponse<Academic>> {
  //   return this.academicsService.deleteAcademic(id);
  // }
}
