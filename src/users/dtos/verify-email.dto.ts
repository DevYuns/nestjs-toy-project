import { Verification } from './../entities/verification.entity';
import { ObjectType, PickType, InputType } from '@nestjs/graphql';
import { CoreOutput } from './../../common/dtos/output.dto';

@ObjectType()
export class VerifyEmailOutput extends CoreOutput {}

@InputType()
export class VerifyEmailInput extends PickType(Verification, ['code']) {}
