import { Restaurant } from './../restaurants/entities/restaurant.entity';
import { User } from './../users/entities/user.entity';
import {
  CreatePaymentOutput,
  CreatePaymentInput,
} from './dtos/create-payment.dto';
import { Payment } from './entities/payment.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { GetPaymentsOutput } from './dtos/get-payments.dto';
import { Cron } from '@nestjs/schedule';

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
          error: 'You are not allowed to do this',
        };
      }

      await this.paymentRepository.save(
        this.paymentRepository.create({
          transactionId,
          user: owner,
          restaurant,
        }),
      );
      restaurant.isPromoted = true;
      const date = new Date();
      date.setDate(date.getDate() + 7);
      restaurant.promotedUntil = date;
      this.RestaurantRepository.save(restaurant);
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

  async getPayments(user: User): Promise<GetPaymentsOutput> {
    try {
      const payments = await this.paymentRepository.find({ user: user });
      return {
        isSucceeded: true,
        payments,
      };
    } catch {
      return {
        isSucceeded: false,
        error: 'Could not load payments.',
      };
    }
  }

  @Cron('* * 0 * * *')
  async checkPromotedRestaurants() {
    const restaurant = await this.RestaurantRepository.find({
      isPromoted: true,
      promotedUntil: LessThan(new Date()),
    });

    restaurant.forEach((restaurant) => {
      restaurant.isPromoted = false;
      restaurant.promotedUntil = null;
    });

    await this.RestaurantRepository.save(restaurant);
  }
}
