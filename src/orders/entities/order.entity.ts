import { Restaurant } from './../../restaurants/entities/restaurant.entity';
import { Dish } from './../../restaurants/entities/dish.entity';
import { User } from './../../users/entities/user.entity';
import { CoreEntity } from './../../common/entities/core.entity';
import { IsEnum, IsNumber } from 'class-validator';
import {
  Field,
  ObjectType,
  InputType,
  registerEnumType,
  Float,
} from '@nestjs/graphql';
import { Entity, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';

export enum OrderStatus {
  PENDING = 'PENDING',
  COOKING = 'COOKING',
  PICKED_UP = 'PICKED_UP',
  DELIVERED = 'DELIVERED',
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });

@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  customer?: User;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.rides, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  driver?: User;

  @Field(() => Restaurant)
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  restaurant: Restaurant;

  @Field(() => [Dish])
  @ManyToMany(() => Dish)
  @JoinTable()
  dishes: Dish[];

  @Column()
  @Field(() => Float)
  @IsNumber()
  total: number;

  @Column({ type: 'enum', enum: OrderStatus })
  @Field(() => OrderStatus)
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
