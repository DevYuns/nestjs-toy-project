import { Restaurant } from './../entities/restaurant.entity';
import {
  PaginationOutPut,
  PaginationInput,
} from './../../common/dtos/pagination.dto';
import { InputType, ObjectType, Field } from '@nestjs/graphql';

@InputType()
export class RestaurantsInput extends PaginationInput {}

@ObjectType()
export class RestaurantsOutPut extends PaginationOutPut {
  @Field(() => [Restaurant], { nullable: true })
  results?: Restaurant[];
}
