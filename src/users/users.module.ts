import { Order } from './../orders/entities/order.entity';
import { Verification } from './entities/verification.entity';
import { UsersService } from './users.service';
import { UserResolver } from './users.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([User, Verification, Order])],
  providers: [UserResolver, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
