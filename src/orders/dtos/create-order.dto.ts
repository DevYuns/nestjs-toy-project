import { OrderItemChoice } from './../entities/order-item.entity';
import { CoreOutput } from './../../common/dtos/output.dto';
import { InputType, ObjectType, Field } from '@nestjs/graphql';

@InputType()
class CreateOrderItemInput {
  @Field(() => Number)
  disiId: number;

  @Field(() => [OrderItemChoice], { nullable: true })
  options?: OrderItemChoice[];
}

@InputType()
export class CreateOrderInput {
  @Field(() => Number)
  restaurantId: number;

  @Field(() => [CreateOrderItemInput])
  items: CreateOrderItemInput[];
}

@ObjectType()
export class CreateOrderOutput extends CoreOutput {}
