import { Admin } from '@prisma/client';
import { RestrictProperties } from 'src/common/dtos/common.input';

export class AdminEntity implements RestrictProperties<AdminEntity, Admin> {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
