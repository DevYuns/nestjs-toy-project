import { Restaurant } from './../entities/restaurant.entity';
import {
  PaginationInput,
  PaginationOutPut,
} from './../../common/dtos/pagination.dto';
import { InputType, Field, ObjectType } from '@nestjs/graphql';

@InputType()
export class SearchRestaurantInput extends PaginationInput {
  @Field(() => String)
  query: string;
}

@ObjectType()
export class SearchRestaurantOutput extends PaginationOutPut {
  @Field(() => [Restaurant], { nullable: true })
  restaurants?: Restaurant[];
}
