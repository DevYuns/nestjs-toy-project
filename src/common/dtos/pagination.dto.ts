import { CoreOutput } from './output.dto';
import { InputType, Field, ObjectType } from '@nestjs/graphql';

@InputType()
export class PaginationInput {
  @Field(() => Number, { defaultValue: 1 })
  page: number;
}

@ObjectType()
export class PaginationOutPut extends CoreOutput {
  @Field(() => Number, { nullable: true })
  totalPages?: number;
}
