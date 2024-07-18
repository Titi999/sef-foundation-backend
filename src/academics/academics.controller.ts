import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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

@Controller('academics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AcademicsController {
  constructor(private academicsService: AcademicsService) {}

  @UsePipes(new ValidationPipe())
  @Roles(['beneficiary'])
  @Post(':id')
  async createBeneficiaryAcademic(
    @Param('id') id: string,
    @Body() academicsDto: AcademicsDto,
  ): Promise<IResponse<Academic>> {
    return this.academicsService.createAcademic(academicsDto, id);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin', 'admin'])
  @Post()
  async createAcademic(
    @Body() academicsDto: AcademicsDto,
  ): Promise<IResponse<Academic>> {
    return this.academicsService.createAcademic(academicsDto);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin', 'admin'])
  @Get()
  async getAcademics(): Promise<IResponse<IPagination<Academic[]>>> {
    return this.academicsService.getAcademics(1, '');
  }

  @UsePipes(new ValidationPipe())
  @Roles(['beneficiary'])
  @Get(':id')
  async getBeneficiaryAcademics(
    @Param('id') id: string,
  ): Promise<IResponse<IPagination<Academic[]>>> {
    return this.academicsService.getAcademics(1, '', id);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['beneficiary'])
  @Put(':userId/:id')
  async updateBeneficiaryAcademic(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() academicsDto: AcademicsDto,
  ): Promise<IResponse<Academic>> {
    return this.academicsService.updateAcademic(id, academicsDto, userId);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin', 'admin'])
  @Put(':id')
  async updateAcademic(
    @Param('id') id: string,
    @Body() academicsDto: AcademicsDto,
  ): Promise<IResponse<Academic>> {
    return this.academicsService.updateAcademic(id, academicsDto);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['super admin', 'admin'])
  @Delete(':id')
  async deleteAcademic(@Param('id') id: string): Promise<IResponse<Academic>> {
    return this.academicsService.deleteAcademic(id);
  }

  @UsePipes(new ValidationPipe())
  @Roles(['beneficiary'])
  @Delete(':userId/:academicId')
  async deleteBeneficiaryAcademic(
    @Param('userId') userId: string,
    @Param('academicId') academicId: string,
  ): Promise<IResponse<Academic>> {
    return this.academicsService.deleteAcademic(academicId, userId);
  }
}
