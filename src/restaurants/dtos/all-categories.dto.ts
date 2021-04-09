import { Category } from './../entities/category.entity';
import { ObjectType, Field } from '@nestjs/graphql';
import { CoreOutput } from './../../common/dtos/output.dto';

@ObjectType()
export class allCategoriesOutput extends CoreOutput {
  @Field(() => [Category], { nullable: true })
  categories?: Category[];
}
