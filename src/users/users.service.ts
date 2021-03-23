import { Verification } from './entities/verification.entity';
import { EditProfileInput } from './dtos/edit-profile.dto';
import { JwtService } from './../jwt/jwt.service';
import { LoginInput, LoginOutput } from './dtos/login.dto';
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
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    private readonly jwtService: JwtService,
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
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      await this.verifications.save(
        this.verifications.create({
          user,
        }),
      );
      return { isSucceeded: true };
    } catch (error) {
      return {
        isSucceeded: false,
        error: "Couldn't create an account",
      };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.users.findOne(
        { email },
        { select: ['id', 'password'] },
      );

      if (!user) {
        return {
          isSucceeded: false,
          error: 'User not found',
        };
      }
      const checkPassword = await user.checkPassword(password);
      if (!checkPassword) {
        return {
          isSucceeded: false,
          error: 'Wrong password',
        };
      }
      const token = this.jwtService.sign(user.id);
      return {
        isSucceeded: true,
        token,
      };
    } catch (error) {
      return {
        isSucceeded: false,
        error,
      };
    }
  }

  async findById(id: number): Promise<User> {
    return this.users.findOne({ id });
  }

  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<User> {
    const user = await this.users.findOne(userId);
    if (email) {
      user.email = email;
      user.verified = false;
      await this.verifications.save(this.verifications.create({ user }));
    }
    if (password) {
      user.password = password;
    }
    return this.users.save(user);
  }

  async verifyEmail(code: string): Promise<boolean> {
    try {
      const verification = await this.verifications.findOne(
        { code },
        { relations: ['user'] },
      );
      if (verification) {
        verification.user.verified = true;
        this.users.save(verification.user);
        return true;
      }
      return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
