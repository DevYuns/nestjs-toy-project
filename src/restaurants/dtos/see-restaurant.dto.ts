import { CoreOutput } from './../../common/dtos/output.dto';
import { Restaurant } from './../entities/restaurant.entity';
import { InputType, Field, ObjectType } from '@nestjs/graphql';

@InputType()
export class SeeRestaurantInput {
  @Field(() => Number)
  restaurantId: number;
}

@ObjectType()
export class SeeRestaurantOutput extends CoreOutput {
  @Field(() => Restaurant, { nullable: true })
  restaurant?: Restaurant;
}
