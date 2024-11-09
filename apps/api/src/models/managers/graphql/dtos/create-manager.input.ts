import { InputType, PickType } from '@nestjs/graphql';
import { Manager } from '../entity/manager.entity';

@InputType()
export class CreateManagerInput extends PickType(
  Manager,
  ['id', 'displayName'],
  InputType,
) {}
