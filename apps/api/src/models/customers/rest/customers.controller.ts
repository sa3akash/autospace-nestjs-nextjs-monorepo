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
import { CreateCustomer } from './dtos/create.dto'
import { CustomerQueryDto } from './dtos/query.dto'
import { UpdateCustomer } from './dtos/update.dto'
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger'
import { CustomerEntity } from './entity/customer.entity'
import { AllowAuthenticated, GetUser } from 'src/common/auth/auth.decorator'
import { GetUserType } from 'src/common/types'
import { checkRowLevelPermission } from 'src/common/auth/util'

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly prisma: PrismaService) {}

  @AllowAuthenticated()
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: CustomerEntity })
  @Post()
  create(
    @Body() createCustomerDto: CreateCustomer,
    @GetUser() user: GetUserType,
  ) {
    checkRowLevelPermission(user, createCustomerDto.id)
    return this.prisma.customer.create({ data: createCustomerDto })
  }

  @ApiOkResponse({ type: [CustomerEntity] })
  @Get()
  findAll(@Query() { skip, take, order, sortBy }: CustomerQueryDto) {
    return this.prisma.customer.findMany({
      ...(skip ? { skip: +skip } : null),
      ...(take ? { take: +take } : null),
      ...(sortBy ? { orderBy: { [sortBy]: order || 'asc' } } : null),
    })
  }

  @ApiOkResponse({ type: CustomerEntity })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prisma.customer.findUnique({ where: { id } })
  }

  @ApiOkResponse({ type: CustomerEntity })
  @ApiBearerAuth()
  @AllowAuthenticated()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomer,
    @GetUser() user: GetUserType,
  ) {
    const customer = await this.prisma.customer.findUnique({ where: { id } })
    checkRowLevelPermission(user, customer.id)
    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    })
  }

  @ApiBearerAuth()
  @AllowAuthenticated()
  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser() user: GetUserType) {
    const customer = await this.prisma.customer.findUnique({ where: { id } })
    checkRowLevelPermission(user, customer.id)
    return this.prisma.customer.delete({ where: { id } })
  }
}
