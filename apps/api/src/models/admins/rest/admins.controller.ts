import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';

import { PrismaService } from 'src/common/prisma/prisma.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateAdmin } from './dtos/create.dto';
import { AdminQueryDto } from './dtos/query.dto';
import { UpdateAdmin } from './dtos/update.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { AdminEntity } from './entity/admin.entity';
import { AllowAuthenticated, GetUser } from 'src/common/auth/auth.decorator';
import { GetUserType } from 'src/common/types';
import { checkRowLevelPermission } from 'src/common/auth/util';

@ApiTags('admins')
@Controller('admins')
export class AdminsController {
  constructor(private readonly prisma: PrismaService) {}

  @AllowAuthenticated()
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: AdminEntity })
  @Post()
  create(@Body() createAdminDto: CreateAdmin, @GetUser() user: GetUserType) {
    checkRowLevelPermission(user, createAdminDto.id);
    return this.prisma.admin.create({ data: createAdminDto });
  }

  @ApiOkResponse({ type: [AdminEntity] })
  @Get()
  findAll(@Query() { skip, take, order, sortBy }: AdminQueryDto) {
    return this.prisma.admin.findMany({
      ...(skip ? { skip: +skip } : null),
      ...(take ? { take: +take } : null),
      ...(sortBy ? { orderBy: { [sortBy]: order || 'asc' } } : null),
    });
  }

  @ApiOkResponse({ type: AdminEntity })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prisma.admin.findUnique({ where: { id } });
  }

  @ApiOkResponse({ type: AdminEntity })
  @ApiBearerAuth()
  @AllowAuthenticated()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateAdmin,
    @GetUser() user: GetUserType,
  ) {
    const admin = await this.prisma.admin.findUnique({ where: { id } });
    checkRowLevelPermission(user, admin.id);
    return this.prisma.admin.update({
      where: { id },
      data: updateAdminDto,
    });
  }

  @ApiBearerAuth()
  @AllowAuthenticated()
  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser() user: GetUserType) {
    const admin = await this.prisma.admin.findUnique({ where: { id } });
    checkRowLevelPermission(user, admin.id);
    return this.prisma.admin.delete({ where: { id } });
  }
}
