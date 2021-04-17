import { Restaurant } from './restaurant.entity';
import { CoreEntity } from './../../common/entities/core.entity';
import { IsString, IsNumber, Length } from 'class-validator';
import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { Entity, Column, ManyToOne, RelationId } from 'typeorm';

@InputType('DishChoiceInput', { isAbstract: true })
@ObjectType()
export class DishChoice {
  @Field(() => String)
  name: string;

  @Field(() => Number, { nullable: true })
  extra?: number;
}

@InputType('DishOptionInput', { isAbstract: true })
@ObjectType()
export class DishOption {
  @Field(() => String)
  name: string;

  @Field(() => [DishChoice], { nullable: true })
  choices?: DishChoice[];

  @Field(() => Number, { nullable: true })
  extra?: number;
}

@InputType('DishInput', { isAbstract: true })
@ObjectType()
@Entity()
export class Dish extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  name: string;

  @Field(() => Number)
  @Column()
  @IsNumber()
  price: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  photo: string;

  @Field(() => String)
  @Column()
  @Length(10, 140)
  description: string;

  @Field(() => Restaurant)
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menu, {
    onDelete: 'CASCADE',
  })
  restaurant: Restaurant;

  @RelationId((dish: Dish) => dish.restaurant)
  restaurantId: number;

  @Field(() => [DishOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options: DishOption[];
}
