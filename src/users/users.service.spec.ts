import { MailService } from './../mail/mail.service';
import { JwtService } from './../jwt/jwt.service';
import { Verification } from './entities/verification.entity';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const mockRepository = () => ({
  findOne: jest.fn(),
  findOneOrFail: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(() => 'signed-token'),
  verify: jest.fn(),
});

const mockMailService = () => ({
  sendVerificationEmail: jest.fn(),
});

describe('UserService', () => {
  let service: UsersService;
  let usersRepository: MockRepository<User>;
  let verificationsRepository: MockRepository<Verification>;
  let mailService: MailService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService(),
        },
        {
          provide: MailService,
          useValue: mockMailService(),
        },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
    usersRepository = module.get(getRepositoryToken(User));
    verificationsRepository = module.get(getRepositoryToken(Verification));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    const creaetAccountArgs = {
      email: 'test@test.com',
      password: '12345',
      role: 0,
    };
    it('should fail if user exists', async () => {
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'fakeEmail@email.com',
      });
      const result = await service.createAccount(creaetAccountArgs);
      expect(result).toMatchObject({
        isSucceeded: false,
        error: 'There is an user with that email already',
      });
    });

    it('should create an user', async () => {
      usersRepository.findOne.mockResolvedValue(undefined);
      usersRepository.create.mockReturnValue(creaetAccountArgs);
      usersRepository.save.mockResolvedValue(creaetAccountArgs);

      verificationsRepository.create.mockReturnValue({
        user: creaetAccountArgs,
      });
      verificationsRepository.save.mockResolvedValue({
        code: 'code',
      });

      const result = await service.createAccount(creaetAccountArgs);

      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(creaetAccountArgs);

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(creaetAccountArgs);

      expect(verificationsRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.create).toHaveBeenCalledWith({
        user: creaetAccountArgs,
      });

      expect(verificationsRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.save).toHaveBeenCalledWith({
        user: creaetAccountArgs,
      });

      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );
      expect(result).toEqual({ isSucceeded: true });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error('err'));
      const result = await service.createAccount(creaetAccountArgs);
      expect(result).toEqual({
        isSucceeded: false,
        error: "Couldn't create an account",
      });
    });
  });

  describe('login', () => {
    const loginArgs = {
      email: 'test@email.com',
      password: 'test',
    };

    it('should fail if user does not exist', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      const result = await service.login(loginArgs);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
      expect(result).toEqual({
        isSucceeded: false,
        error: 'User not found',
      });
    });

    it('should fail if the password is wrong', async () => {
      const mockedUser = {
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };

      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(result).toEqual({
        isSucceeded: false,
        error: 'Wrong password',
      });
    });

    it('should return token if password correct', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };

      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);

      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));

      expect(result).toEqual({
        isSucceeded: true,
        token: 'signed-token',
      });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error('err'));
      const result = await service.login(loginArgs);

      expect(result).toEqual({
        isSucceeded: false,
        error: new Error('err'),
      });
    });
  });
  describe('findById', () => {
    const findByIdArgs = {
      id: 1,
    };
    it('should find an existing user', async () => {
      usersRepository.findOneOrFail.mockResolvedValue(findByIdArgs);

      const result = await service.findById(1);

      expect(result).toEqual({
        isSucceeded: true,
        user: findByIdArgs,
      });
    });

    it('should fail if no user found', async () => {
      usersRepository.findOneOrFail.mockRejectedValue(new Error());
      const result = await service.findById(1);
      expect(result).toEqual({
        isSucceeded: false,
        error: 'User Not Found',
      });
    });
  });

  describe('editProfile', () => {
    it('sould change email', async () => {
      const oldUser = {
        email: 'test@old.com',
        verified: true,
      };

      const editProfileArgs = {
        userId: 1,
        input: {
          email: 'test@new.com',
        },
      };

      const newVerification = {
        code: 'code',
      };

      const newUser = {
        verified: false,
        email: editProfileArgs.input.email,
      };
      usersRepository.findOne.mockResolvedValue(oldUser);
      verificationsRepository.create.mockReturnValue(newVerification);
      verificationsRepository.save.mockResolvedValue(newVerification);

      await service.editProfile(editProfileArgs.userId, editProfileArgs.input);
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        editProfileArgs.userId,
      );

      expect(verificationsRepository.create).toHaveBeenCalledWith({
        user: newUser,
      });
      expect(verificationsRepository.save).toHaveBeenCalledWith(
        newVerification,
      );

      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        newUser.email,
        newVerification.code,
      );
    });

    it('should change password', async () => {
      const editProfileArgs = {
        userId: 1,
        input: { password: 'newPassword' },
      };
      usersRepository.findOne.mockResolvedValue({ password: 'old' });
      const result = await service.editProfile(
        editProfileArgs.userId,
        editProfileArgs.input,
      );

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(editProfileArgs.input);
      expect(result).toEqual({ isSucceeded: true });
    });

    it('should fail on exeception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.editProfile(1, { email: 'test@test.com' });
      expect(result).toEqual({
        isSucceeded: false,
        error: 'Could not update profile',
      });
    });
  });

  describe('verfyEmail', () => {
    it('sould verify email', async () => {
      const mockedVerification = {
        user: {
          verified: false,
        },
        id: 1,
      };

      verificationsRepository.findOne.mockResolvedValue(mockedVerification);
      const result = await service.verifyEmail('');

      expect(verificationsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(
        mockedVerification.user,
      );

      expect(verificationsRepository.delete).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.delete).toHaveBeenCalledWith(
        mockedVerification.id,
      );
      expect(result).toEqual({ isSucceeded: true });
    });

    it('should fail on verification not found', async () => {
      verificationsRepository.findOne.mockResolvedValue(undefined);
      const result = await service.verifyEmail('');

      expect(result).toEqual({
        isSucceeded: false,
        error: 'Verification not found',
      });
    });

    it('should fail on exeception', async () => {
      verificationsRepository.findOne.mockRejectedValue(new Error());
      const result = await service.verifyEmail('');

      expect(result).toEqual({
        isSucceeded: false,
        error: 'could not verify email',
      });
    });
  });
});
