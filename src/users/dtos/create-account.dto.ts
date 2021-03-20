import { MutationOutput } from './../../common/dtos/output.dto';
import { User } from './../entities/user.entity';
import { InputType, PickType, ObjectType } from '@nestjs/graphql';

@InputType()
export class CreateAccountInput extends PickType(User, [
  'email',
  'password',
  'role',
]) {}

@ObjectType()
export class CreateAccountOutput extends MutationOutput {}
