import { Restaurant } from './../entities/restaurant.entity';
import {
  PaginationInput,
  PaginationOutPut,
} from './../../common/dtos/pagination.dto';
import { Category } from './../entities/category.entity';
import { ObjectType, Field, InputType } from '@nestjs/graphql';

@InputType()
export class CategoryInput extends PaginationInput {
  @Field(() => String)
  slug: string;
}

@ObjectType()
export class CategoryOutput extends PaginationOutPut {
  @Field(() => Restaurant, { nullable: true })
  restaurants?: Restaurant[];

  @Field(() => Category, { nullable: true })
  category?: Category;
}
