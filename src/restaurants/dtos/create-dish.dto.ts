import { CoreOutput } from './../../common/dtos/output.dto';
import { Dish } from './../entities/dish.entity';
import { Field, ObjectType, InputType, PickType } from '@nestjs/graphql';

@InputType()
export class CreateDishInput extends PickType(Dish, [
  'name',
  'price',
  'description',
  'options',
]) {
  @Field(() => Number)
  restaurantId: number;
}

@ObjectType()
export class CreateDishOutput extends CoreOutput {}
