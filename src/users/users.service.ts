import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const exists = await this.users.findOne({ email });
      if (exists) {
        return {
          isSucceeded: false,
          error: 'There is an user with that email already',
        };
      }
      await this.users.save(this.users.create({ email, password, role }));
      return { isSucceeded: true };
    } catch (error) {
      return {
        isSucceeded: false,
        error: "Couldn't create an account",
      };
    }
  }
}
