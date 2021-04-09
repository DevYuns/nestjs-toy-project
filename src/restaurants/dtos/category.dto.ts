import { Category } from './../entities/category.entity';
import { CoreOutput } from './../../common/dtos/output.dto';
import { ObjectType, Field, ArgsType } from '@nestjs/graphql';

@ArgsType()
export class CategoryInput {
  @Field(() => String)
  slug: string;
}

@ObjectType()
export class CategoryOutput extends CoreOutput {
  @Field(() => Category, { nullable: true })
  category?: Category;
}
