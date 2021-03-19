import { CreateRestaurantDto } from './create-restaurant.dto';
import { InputType, PartialType, ArgsType, Field } from '@nestjs/graphql';
@InputType()
class UpdateRestaurantInputType extends PartialType(CreateRestaurantDto) {}

@ArgsType()
export class UpdateRestaurantDto {
  @Field(() => Number)
  id: number;

  @Field(() => UpdateRestaurantInputType)
  data: UpdateRestaurantInputType;
}
