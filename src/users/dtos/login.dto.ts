import { User } from './../entities/user.entity';
import { CoreOutput } from './../../common/dtos/output.dto';
import { InputType, PickType, ObjectType, Field } from '@nestjs/graphql';

@InputType()
export class LoginInput extends PickType(User, ['email', 'password']) {}

@ObjectType()
export class LoginOutput extends CoreOutput {
  @Field(() => String, { nullable: true })
  token?: string;
}
