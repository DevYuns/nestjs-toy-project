import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { OrderItem } from './entities/order-item.entity';
import { Restaurant } from './../restaurants/entities/restaurant.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { User, UserRole } from './../users/entities/user.entity';
import { Order, OrderStatus } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { NEW_PENDING_ORDER, PUB_SUB } from '../common/common.constants';
import { PubSub } from 'graphql-subscriptions';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Dish)
    private readonly disheRepository: Repository<Dish>,
    @Inject(PUB_SUB) private readonly pubsub: PubSub,
  ) {}

  async createOrder(
    customer: User,
    { restaurantId, items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const restaurant = await this.restaurantRepository.findOne(restaurantId);

      if (!restaurant) {
        return {
          isSucceeded: false,
          error: 'Restaurant not found',
        };
      }
      let orderFinalPrice = 0;
      const orderItems: OrderItem[] = [];
      for (const item of items) {
        const dish = await this.disheRepository.findOne(item.disiId);
        if (!dish) {
          return {
            isSucceeded: false,
            error: 'Dish not found',
          };
        }
        let dishFinalPrice = dish.price;
        for (const itemOption of item.options) {
          const dishOption = dish.options.find(
            (dishOption) => dishOption.name === itemOption.name,
          );

          if (dishOption) {
            if (dishOption.extra) {
              dishFinalPrice += dishOption.extra;
            } else {
              const dishOptionChoice = dishOption.choices.find(
                (optionChoice) => optionChoice.name === itemOption.choice,
              );
              if (dishOptionChoice) {
                if (dishOptionChoice.extra) {
                  dishFinalPrice += dishOptionChoice.extra;
                }
              }
            }
          }
        }
        orderFinalPrice += dishFinalPrice;
        const orderItem = await this.orderItemRepository.save(
          this.orderItemRepository.create({
            dish,
            options: item.options,
          }),
        );
        orderItems.push(orderItem);
      }

      const order = await this.orderRepository.save(
        this.orderRepository.create({
          customer,
          restaurant,
          total: orderFinalPrice,
          items: orderItems,
        }),
      );

      await this.pubsub.publish(NEW_PENDING_ORDER, {
        pendingOrders: { order, ownerId: restaurant.ownerId },
      });
      return {
        isSucceeded: true,
      };
    } catch (error) {
      return {
        isSucceeded: false,
        error,
      };
    }
  }

  async getOrders(
    user: User,
    { status }: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    try {
      let orders: Order[];
      if (user.role === UserRole.CLIENT) {
        orders = await this.orderRepository.find({
          where: {
            customer: user,
            ...(status && { status }),
          },
        });
      } else if (user.role === UserRole.DELIVERY) {
        orders = await this.orderRepository.find({
          where: {
            driver: user,
            ...(status && { status }),
          },
        });
      } else if (user.role === UserRole.OWNER) {
        const restaurants = await this.restaurantRepository.find({
          where: {
            owner: User,
          },
          relations: ['orders'],
        });
        orders = restaurants.map((restaurant) => restaurant.orders).flat(1);
        if (status) {
          orders = orders.filter((order) => order.status === status);
        }
      }

      return {
        isSucceeded: true,
        orders,
      };
    } catch (error) {
      return {
        isSucceeded: false,
        error,
      };
    }
  }

  canSeeOrder(user: User, order: Order): boolean {
    let canSee = true;
    if (user.role === UserRole.CLIENT && order.customerId !== user.id) {
      canSee = false;
    }
    if (user.role === UserRole.DELIVERY && order.driverId !== user.id) {
      canSee = false;
    }
    if (user.role === UserRole.OWNER && order.restaurant.ownerId !== user.id) {
      canSee = false;
    }
    return canSee;
  }

  async getOrder(
    user: User,
    { id: orderId }: GetOrderInput,
  ): Promise<GetOrderOutput> {
    try {
      const order = await this.orderRepository.findOne(orderId, {
        relations: ['restaurant'],
      });

      if (!order) {
        return {
          isSucceeded: false,
          error: 'Order not found',
        };
      }

      if (this.canSeeOrder(user, order)) {
        return {
          isSucceeded: false,
          error: "You can't see that",
        };
      }

      return {
        isSucceeded: true,
        order,
      };
    } catch (error) {
      return {
        isSucceeded: false,
        error,
      };
    }
  }

  async editOrder(
    user: User,
    { id: orderId, status }: EditOrderInput,
  ): Promise<EditOrderOutput> {
    try {
      const order = await this.orderRepository.findOne(orderId, {
        relations: ['restaurant'],
      });

      if (!order) {
        return {
          isSucceeded: false,
          error: 'Order not found',
        };
      }

      if (!this.canSeeOrder(user, order)) {
        return {
          isSucceeded: false,
          error: "Can't see this.",
        };
      }
      let canEdit = true;
      if (user.role === UserRole.CLIENT) {
        canEdit = false;
      }
      if (user.role === UserRole.OWNER) {
        if (status !== OrderStatus.COOKING && status !== OrderStatus.COOKED) {
          canEdit = false;
        }
      }
      if (user.role === UserRole.DELIVERY) {
        if (
          status !== OrderStatus.PICKED_UP &&
          status !== OrderStatus.DELIVERED
        ) {
          canEdit = false;
        }
      }
      if (!canEdit) {
        return {
          isSucceeded: false,
          error: "You can't do that.",
        };
      }

      await this.orderRepository.save([
        {
          id: orderId,
          status,
        },
      ]);
      return {
        isSucceeded: true,
      };
    } catch (error) {
      return {
        isSucceeded: false,
        error,
      };
    }
  }
}
