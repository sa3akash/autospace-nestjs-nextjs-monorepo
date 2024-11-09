import { Customer } from '@prisma/client'
import { IsDate, IsString, IsInt, IsOptional } from 'class-validator'
import { RestrictProperties } from 'src/common/dtos/common.input'

export class CustomerEntity
  implements RestrictProperties<CustomerEntity, Customer>
{
  id: string
  createdAt: Date
  updatedAt: Date
  @IsOptional()
  displayName: string
}
