import { CoreOutput } from './../../common/dtos/output.dto';
import { InputType, Field, ObjectType } from '@nestjs/graphql';

@InputType()
export class DeleteDishInput {
  @Field(() => Number)
  dishId: number;
}

@ObjectType()
export class DeleteDishOutput extends CoreOutput {}
