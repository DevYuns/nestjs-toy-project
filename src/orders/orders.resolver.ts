import { TakeOrderOutput, TakeOrderInput } from './dtos/take-order.dto';
import {
  NEW_COOKED_ORDER,
  NEW_ORDER_UPDATE,
} from './../common/common.constants';
import { PubSub } from 'graphql-subscriptions';
import { EditOrderOutput, EditOrderInput } from './dtos/edit-order.dto';
import { GetOrderOutput, GetOrderInput } from './dtos/get-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { CreateOrderOutput, CreateOrderInput } from './dtos/create-order.dto';
import { Args, Mutation, Resolver, Query, Subscription } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
import { Order } from './entities/order.entity';
import { OrderService } from './orders.service';
import { Inject } from '@nestjs/common';
import { NEW_PENDING_ORDER, PUB_SUB } from '../common/common.constants';
import { OrderUpdatesInput } from './dtos/order-updates.dto';

@Resolver(() => Order)
export class OrderResolver {
  constructor(
    private readonly orderService: OrderService,
    @Inject(PUB_SUB) private readonly pubsub: PubSub,
  ) {}

  @Mutation(() => CreateOrderOutput)
  @Role(['CLIENT'])
  async createOrder(
    @AuthUser() customer: User,
    @Args('input') createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.orderService.createOrder(customer, createOrderInput);
  }

  @Query(() => GetOrdersOutput)
  @Role(['Any'])
  async getOrders(
    @AuthUser() user: User,
    @Args('input') getOrdersInput: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    return this.orderService.getOrders(user, getOrdersInput);
  }

  @Query(() => GetOrderOutput)
  @Role(['Any'])
  async getOrder(
    @AuthUser() user: User,
    @Args('input') getOrderInput: GetOrderInput,
  ): Promise<GetOrderOutput> {
    return this.orderService.getOrder(user, getOrderInput);
  }

  @Mutation(() => EditOrderOutput)
  @Role(['Any'])
  async editOrder(
    @AuthUser() user: User,
    @Args('input') editOrderInput: EditOrderInput,
  ): Promise<EditOrderOutput> {
    return this.orderService.editOrder(user, editOrderInput);
  }

  @Subscription(() => Order, {
    filter: ({ pedingOrders: { ownerId } }, _, { user }) => {
      return ownerId === user.id;
    },
    resolve: ({ pedingOrders: { order } }) => order,
  })
  @Role(['OWNER'])
  pendingOrders() {
    return this.pubsub.asyncIterator(NEW_PENDING_ORDER);
  }

  @Subscription(() => Order)
  @Role(['DELIVERY'])
  cookedOrder() {
    return this.pubsub.asyncIterator(NEW_COOKED_ORDER);
  }

  @Subscription(() => Order, {
    filter: (
      { orderUpdates: order }: { orderUpdates: Order },
      { input }: { input: OrderUpdatesInput },
      { user }: { user: User },
    ) => {
      if (
        order.driverId !== user.id &&
        order.customerId !== user.id &&
        order.restaurant.ownerId !== user.id
      ) {
        return false;
      }
      return order.id === input.id;
    },
  })
  @Role(['Any'])
  orderUpdates(@Args('input') orderUpdatesInput: OrderUpdatesInput) {
    return this.pubsub.asyncIterator(NEW_ORDER_UPDATE);
  }

  @Mutation(() => TakeOrderOutput)
  @Role(['DELIVERY'])
  takeOrder(
    @Args('input') takeOrderInput: TakeOrderInput,
    @AuthUser() driver: User,
  ): Promise<TakeOrderOutput> {
    return this.orderService.takeOrder(driver, takeOrderInput);
  }
}
