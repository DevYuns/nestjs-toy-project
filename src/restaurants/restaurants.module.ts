import { Category } from './entities/category.entity';
import { RestaurantService } from './restaurants.service';
import { Restaurant } from './entities/restaurant.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantResolver } from './restaurants.resolver';
import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, Category])],
  providers: [RestaurantResolver, RestaurantService],
})
export class RestaurantsModule {}
