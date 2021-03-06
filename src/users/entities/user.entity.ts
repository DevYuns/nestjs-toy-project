import { Payment } from './../../payments/entities/payment.entity';
import { Order } from './../../orders/entities/order.entity';
import { Restaurant } from './../../restaurants/entities/restaurant.entity';
import {
  ObjectType,
  InputType,
  Field,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from './../../common/entities/core.entity';
import { Entity, Column, BeforeInsert, BeforeUpdate, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { IsEmail, IsString, IsEnum, IsBoolean } from 'class-validator';

export enum UserRole {
  CLIENT = 'CLIENT',
  OWNER = 'OWNER',
  DELIVERY = 'DELIVERY',
}

registerEnumType(UserRole, { name: 'UserRole' });
@InputType('UserInput', { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Column({ unique: true })
  @Field(() => String)
  @IsEmail()
  email: string;

  @Column({ select: false })
  @Field(() => String)
  @IsString()
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  @Field(() => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  @Column({ default: false })
  @Field(() => Boolean)
  @IsBoolean()
  verified: boolean;

  @OneToMany(() => Restaurant, (restaurant) => restaurant.owner)
  @Field(() => [Restaurant])
  restaurants: Restaurant[];

  @OneToMany(() => Order, (order) => order.customer)
  @Field(() => [Order])
  orders: Order[];

  @OneToMany(() => Payment, (payment) => payment.user)
  @Field(() => [Payment])
  payments: Payment[];

  @OneToMany(() => Order, (order) => order.driver)
  @Field(() => [Order])
  rides: Order[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (error) {
        console.log(error);
        throw new InternalServerErrorException();
      }
    }
  }

  async checkPassword(password: string): Promise<boolean> {
    try {
      const isSucceeded = await bcrypt.compare(password, this.password);
      return isSucceeded;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }
}
