import { Restaurant } from './../restaurants/entities/restaurant.entity';
import { User } from './../users/entities/user.entity';
import {
  CreatePaymentOutput,
  CreatePaymentInput,
} from './dtos/create-payment.dto';
import { Payment } from './entities/payment.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly RestaurantRepository: Repository<Restaurant>,
  ) {}

  async createPayment(
    owner: User,
    { transactionId, restaurantId }: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    try {
      const restaurant = await this.RestaurantRepository.findOne(restaurantId);

      if (!restaurant) {
        return {
          isSucceeded: false,
          error: 'Restaurant not found',
        };
      }

      if (restaurant.ownerId !== owner.id) {
        return {
          isSucceeded: false,
          error: 'Tou are not allowed to do this',
        };
      }

      await this.paymentRepository.save(
        this.paymentRepository.create({
          transactionId,
          user: owner,
          restaurant,
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
}
