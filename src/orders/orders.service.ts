import { Dish } from 'src/restaurants/entities/dish.entity';
import { OrderItem } from './entities/order-item.entity';
import { Restaurant } from './../restaurants/entities/restaurant.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { User } from './../users/entities/user.entity';
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

      for (const item of items) {
        const dish = await this.disheRepository.findOne(item.disiId);
        if (!dish) {
          return {
            isSucceeded: false,
            error: 'Dish not found',
          };
        }
        await this.orderItemRepository.save(
          this.orderItemRepository.create({ dish, options: item.options }),
        );
      }

      const order = await this.orderRepository.save(
        this.orderRepository.create({
          customer,
          restaurant,
        }),
      );
    } catch (error) {
      return {
        isSucceeded: false,
        error,
      };
    }
  }
}
