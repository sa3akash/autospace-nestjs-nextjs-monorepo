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
import { CreateUser } from './dtos/create.dto';
import { UserQueryDto } from './dtos/query.dto';
import { UpdateUser } from './dtos/update.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { UserEntity } from './entity/user.entity';
import { AllowAuthenticated, GetUser } from 'src/common/auth/auth.decorator';
import { GetUserType } from 'src/common/types';
import { checkRowLevelPermission } from 'src/common/auth/util';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @AllowAuthenticated()
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: UserEntity })
  @Post()
  create(@Body() createUserDto: CreateUser, @GetUser() user: GetUserType) {
    checkRowLevelPermission(user, createUserDto.id);
    return this.prisma.user.create({ data: createUserDto });
  }

  @ApiOkResponse({ type: [UserEntity] })
  @Get()
  findAll(@Query() { skip, take, order, sortBy }: UserQueryDto) {
    return this.prisma.user.findMany({
      ...(skip ? { skip: +skip } : null),
      ...(take ? { take: +take } : null),
      ...(sortBy ? { orderBy: { [sortBy]: order || 'asc' } } : null),
    });
  }

  @ApiOkResponse({ type: UserEntity })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  @ApiOkResponse({ type: UserEntity })
  @ApiBearerAuth()
  @AllowAuthenticated()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUser,
    @GetUser() user2: GetUserType,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    checkRowLevelPermission(user2, user.id);
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  @ApiBearerAuth()
  @AllowAuthenticated()
  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser() user2: GetUserType) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    checkRowLevelPermission(user2, user.id);
    return this.prisma.user.delete({ where: { id } });
  }
}
