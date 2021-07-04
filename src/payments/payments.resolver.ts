import { User } from './../users/entities/user.entity';
import { AuthUser } from './../auth/auth-user.decorator';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from './dtos/create-payment.dto';
import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { Payment } from './entities/payment.entity';
import { PaymentService } from './payments.service';
import { Role } from '../auth/role.decorator';
import { GetPaymentsOutput } from './dtos/get-payments.dto';

@Resolver(() => Payment)
export class PaymentResovler {
  constructor(private readonly paymentService: PaymentService) {}

  @Mutation(() => CreatePaymentOutput)
  @Role(['OWNER'])
  async createPayment(
    @AuthUser() owner: User,
    @Args('input') createPaymentInput: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    return this.paymentService.createPayment(owner, createPaymentInput);
  }

  @Query(() => GetPaymentsOutput)
  @Role(['OWNER'])
  async getPayments(@AuthUser() user: User): Promise<GetPaymentsOutput> {
    return this.paymentService.getPayments(user);
  }
}
