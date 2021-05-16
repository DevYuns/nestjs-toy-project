import { CoreOutput } from './../../common/dtos/output.dto';
import { Order } from './../entities/order.entity';
import { InputType, ObjectType, PickType } from '@nestjs/graphql';

@InputType()
export class TakeOrderInput extends PickType(Order, ['id']) {}

@ObjectType()
export class TakeOrderOutput extends CoreOutput {}
