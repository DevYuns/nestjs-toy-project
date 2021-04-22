import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { OrderItem } from './entities/order-item.entity';
import { Restaurant } from './../restaurants/entities/restaurant.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { User, UserRole } from './../users/entities/user.entity';
import { Order } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

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

      await this.orderRepository.save(
        this.orderRepository.create({
          customer,
          restaurant,
          total: orderFinalPrice,
          items: orderItems,
        }),
      );

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
          },
        });
      } else if (user.role === UserRole.DELIVERY) {
        orders = await this.orderRepository.find({
          where: {
            driver: user,
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
}
