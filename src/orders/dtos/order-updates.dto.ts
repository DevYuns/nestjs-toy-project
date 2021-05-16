import { Order } from './../entities/order.entity';
import { InputType, PickType } from '@nestjs/graphql';

@InputType()
export class OrderUpdatesInput extends PickType(Order, ['id']) {}
