import { CONFIG_OPTIONS } from './../common/common.constants';
import { Test } from '@nestjs/testing';
import { MailService } from './mail.service';

jest.mock('got');

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            apiKey: 'test-key',
            domain: 'test-domain',
            fromEmail: 'test-fromEmail',
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('should call sendEmail', () => {
      const sendEmailSpy = jest
        .spyOn(MailService.prototype as any, 'sendEmail')
        .mockImplementation(async () => {});

      const sendVerificationEmailArgs = {
        email: 'email',
        code: 'code',
      };

      service.sendVerificationEmail(
        sendVerificationEmailArgs.email,
        sendVerificationEmailArgs.code,
      );

      expect(sendEmailSpy).toHaveBeenCalledTimes(1);
      expect(sendEmailSpy).toHaveBeenCalledWith(
        'Verify your email',
        'confrim-email',
        [
          { key: 'code', value: sendVerificationEmailArgs.code },
          { key: 'username', value: sendVerificationEmailArgs.email },
        ],
      );
    });
  });
});
