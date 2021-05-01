import { CoreOutput } from './../../common/dtos/output.dto';
import { Order } from './../entities/order.entity';
import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';

@InputType()
export class GetOrderInput extends PickType(Order, ['id']) {}

@ObjectType()
export class GetOrderOutput extends CoreOutput {
  @Field(() => Order, { nullable: true })
  order?: Order;
}
