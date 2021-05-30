import { User } from './../users/entities/user.entity';
import { AuthUser } from './../auth/auth-user.decorator';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from './dtos/create-payment.dto';
import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { Payment } from './entities/payment.entity';
import { PaymentService } from './payments.service';
import { Role } from '../auth/role.decorator';

@Resolver(() => Payment)
export class PaymentResovler {
  constructor(private readonly paymentService: PaymentService) {}

  @Mutation(() => CreatePaymentInput)
  @Role(['OWNER'])
  createPayment(
    @AuthUser() owner: User,
    @Args('input') createPaymentInput: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    return this.paymentService.createPayment(owner, createPaymentInput);
  }
}
