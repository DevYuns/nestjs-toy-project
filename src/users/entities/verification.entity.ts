import { v4 as uuidv4 } from 'uuid';
import { User } from './user.entity';
import { CoreEntity } from './../../common/entities/core.entity';
import { Entity, Column, OneToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { InputType, ObjectType, Field } from '@nestjs/graphql';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Verification extends CoreEntity {
  @Column()
  @Field(() => String)
  code: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @BeforeInsert()
  createCode(): void {
    this.code = uuidv4();
  }
}
