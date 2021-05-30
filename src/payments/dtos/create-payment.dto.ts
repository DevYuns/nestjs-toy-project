import { CoreOutput } from './../../common/dtos/output.dto';
import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { Payment } from '../entities/payment.entity';

@InputType()
export class CreatePaymentInput extends PickType(Payment, [
  'transactionId',
  'restaurantId',
]) {}

@ObjectType()
export class CreatePaymentOutput extends CoreOutput {}
