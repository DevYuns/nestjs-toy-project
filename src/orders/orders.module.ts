import { OrderItem } from './entities/order-item.entity';
import { Category } from './../restaurants/entities/category.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from './../restaurants/entities/restaurant.entity';
import { Order } from './entities/order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderResolver } from './orders.resolver';
import { OrderService } from './orders.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Restaurant, Dish, Category, OrderItem]),
  ],
  providers: [OrderService, OrderResolver],
})
export class OrdersModule {}
