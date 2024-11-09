import { InputType, PartialType } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import {
  DateTimeFilter,
  RestrictProperties,
  StringFilter,
} from 'src/common/dtos/common.input';

@InputType()
export class UserWhereUniqueInput {
  id: string;
}

@InputType()
export class UserWhereInputStrict
  implements
    RestrictProperties<
      UserWhereInputStrict,
      Omit<
        Prisma.UserWhereInput,
        | 'Credentials'
        | 'AuthProvider'
        | 'Admin'
        | 'image'
        | 'Customer'
        | 'Manager'
        | 'Valet'
      >
    >
{
  // Customer: CustomerRelationFilter;
  // Manager: ManagerRelationFilter;
  // Valet: ValetRelationFilter;
  id: StringFilter;
  createdAt: DateTimeFilter;
  updatedAt: DateTimeFilter;
  name: StringFilter;

  AND: UserWhereInput[];
  OR: UserWhereInput[];
  NOT: UserWhereInput[];
}

@InputType()
export class UserWhereInput extends PartialType(UserWhereInputStrict) {}

@InputType()
export class UserListRelationFilter {
  every?: UserWhereInput;
  some?: UserWhereInput;
  none?: UserWhereInput;
}

@InputType()
export class UserRelationFilter {
  is?: UserWhereInput;
  isNot?: UserWhereInput;
}
