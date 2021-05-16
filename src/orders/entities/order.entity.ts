import { OrderItem } from './order-item.entity';
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
import {
  Entity,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  RelationId,
} from 'typeorm';

export enum OrderStatus {
  PENDING = 'PENDING',
  COOKING = 'COOKING',
  COOKED = 'COOKED',
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
    eager: true,
  })
  customer?: User;

  @RelationId((order: Order) => order.customer)
  customerId: number;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.rides, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  driver?: User;

  @RelationId((order: Order) => order.driver)
  driverId: number;

  @Field(() => Restaurant, { nullable: true })
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.orders, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  restaurant?: Restaurant;

  @Field(() => [OrderItem])
  @ManyToMany(() => OrderItem, { eager: true })
  @JoinTable()
  items: OrderItem[];

  @Column({ nullable: true })
  @Field(() => Float, { nullable: true })
  @IsNumber()
  total?: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  @Field(() => OrderStatus)
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
