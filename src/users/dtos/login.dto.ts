import { User } from './../entities/user.entity';
import { MutationOutput } from './../../common/dtos/output.dto';
import { InputType, PickType, ObjectType, Field } from '@nestjs/graphql';

@InputType()
export class LoginInput extends PickType(User, ['email', 'password']) {}

@ObjectType()
export class LoginOutput extends MutationOutput {
  @Field(() => String, { nullable: true })
  token?: string;
}
