import { User } from './../entities/user.entity';
import { InputType, PickType, ObjectType, Field } from '@nestjs/graphql';

@InputType()
export class CreateAccountInput extends PickType(User, [
  'email',
  'password',
  'role',
]) {}

@ObjectType()
export class CreateAccountOutput {
  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => Boolean)
  isSucceeded: boolean;
}
