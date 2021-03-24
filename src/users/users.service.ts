import { MailService } from './../mail/mail.service';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { Verification } from './entities/verification.entity';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
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
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const exists = await this.usersRepository.findOne({ email });
      if (exists) {
        return {
          isSucceeded: false,
          error: 'There is an user with that email already',
        };
      }
      const user = await this.usersRepository.save(
        this.usersRepository.create({ email, password, role }),
      );
      const verification = await this.verifications.save(
        this.verifications.create({
          user,
        }),
      );
      this.mailService.sendVerificationEmail(user.email, verification.code);
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
      const user = await this.usersRepository.findOne(
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

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.usersRepository.findOneOrFail({ id });
      return {
        isSucceeded: true,
        user,
      };
    } catch (error) {
      return {
        isSucceeded: false,
        error: 'User Not Found',
      };
    }
  }

  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.usersRepository.findOne(userId);
      if (email) {
        user.email = email;
        user.verified = false;
        const verification = await this.verifications.save(
          this.verifications.create({ user }),
        );
        this.mailService.sendVerificationEmail(user.email, verification.code);
      }
      if (password) {
        user.password = password;
      }
      await this.usersRepository.save(user);
      return {
        isSucceeded: true,
      };
    } catch (error) {
      console.log(error);

      return {
        isSucceeded: false,
        error: 'Could not update profile',
      };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verifications.findOne(
        { code },
        { relations: ['user'] },
      );
      if (verification) {
        verification.user.verified = true;
        await this.usersRepository.save(verification.user);
        await this.verifications.delete(verification.id);
        return {
          isSucceeded: true,
        };
      }
      return {
        isSucceeded: false,
        error: 'Verification not found',
      };
    } catch (error) {
      console.log(error);
      return {
        isSucceeded: false,
        error: 'could not verify email',
      };
    }
  }
}
