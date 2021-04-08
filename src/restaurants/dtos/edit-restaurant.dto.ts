import { CoreOutput } from './../../common/dtos/output.dto';
import { CreateRestaurantInput } from './create-restaurant.dto';
import { InputType, PartialType, ObjectType, Field } from '@nestjs/graphql';
@InputType()
export class EditRestaurantInput extends PartialType(CreateRestaurantInput) {
  @Field()
  restaurantId: number;
}

@ObjectType()
export class EditRestaurantOutput extends CoreOutput {}
