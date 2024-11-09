import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common'

import { PrismaService } from 'src/common/prisma/prisma.service'
import { ApiTags } from '@nestjs/swagger'
import { CreateManager } from './dtos/create.dto'
import { ManagerQueryDto } from './dtos/query.dto'
import { UpdateManager } from './dtos/update.dto'
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger'
import { ManagerEntity } from './entity/manager.entity'
import { AllowAuthenticated, GetUser } from 'src/common/auth/auth.decorator'
import { GetUserType } from 'src/common/types'
import { checkRowLevelPermission } from 'src/common/auth/util'

@ApiTags('managers')
@Controller('managers')
export class ManagersController {
  constructor(private readonly prisma: PrismaService) {}

  @AllowAuthenticated()
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: ManagerEntity })
  @Post()
  create(
    @Body() createManagerDto: CreateManager,
    @GetUser() user: GetUserType,
  ) {
    checkRowLevelPermission(user, createManagerDto.id)
    return this.prisma.manager.create({ data: createManagerDto })
  }

  @ApiOkResponse({ type: [ManagerEntity] })
  @Get()
  findAll(@Query() { skip, take, order, sortBy }: ManagerQueryDto) {
    return this.prisma.manager.findMany({
      ...(skip ? { skip: +skip } : null),
      ...(take ? { take: +take } : null),
      ...(sortBy ? { orderBy: { [sortBy]: order || 'asc' } } : null),
    })
  }

  @ApiOkResponse({ type: ManagerEntity })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prisma.manager.findUnique({ where: { id } })
  }

  @ApiOkResponse({ type: ManagerEntity })
  @ApiBearerAuth()
  @AllowAuthenticated()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateManagerDto: UpdateManager,
    @GetUser() user: GetUserType,
  ) {
    const manager = await this.prisma.manager.findUnique({ where: { id } })
    checkRowLevelPermission(user, manager.id)
    return this.prisma.manager.update({
      where: { id },
      data: updateManagerDto,
    })
  }

  @ApiBearerAuth()
  @AllowAuthenticated()
  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser() user: GetUserType) {
    const manager = await this.prisma.manager.findUnique({ where: { id } })
    checkRowLevelPermission(user, manager.id)
    return this.prisma.manager.delete({ where: { id } })
  }
}
