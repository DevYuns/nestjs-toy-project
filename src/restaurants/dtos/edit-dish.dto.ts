import { Dish } from './../entities/dish.entity';
import { CoreOutput } from './../../common/dtos/output.dto';
import {
  InputType,
  Field,
  ObjectType,
  PickType,
  PartialType,
} from '@nestjs/graphql';

@InputType()
export class EditDishInput extends PickType(PartialType(Dish), [
  'name',
  'options',
  'price',
  'description',
]) {
  @Field(() => Number)
  dishId: number;
}

@ObjectType()
export class EditDishOutput extends CoreOutput {}
