import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Resolver, Query } from '@nestjs/graphql';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => Boolean)
  hi() {
    return true;
  }
}
