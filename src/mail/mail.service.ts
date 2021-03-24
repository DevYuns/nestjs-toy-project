import got from 'got';
import * as Formdata from 'form-data';
import { MailModuleOptions, EmailVar } from './mail.interfaces';
import { CONFIG_OPTIONS } from './../common/common.constants';
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {}

  private async sendEmail(
    subject: string,
    template: string,
    emailVars: EmailVar[],
  ) {
    const form = new Formdata();
    form.append('from', `Dean <mailgun@${this.options.domain}>`);
    form.append('to', `ydhun93@gmail.com`);
    form.append('subject', subject);
    form.append('template', template);
    emailVars.forEach((eVar) => form.append(`v:${eVar.key}`, eVar.value));
    try {
      await got(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(
            `api:${this.options.apiKey}`,
          ).toString('base64')}`,
        },
        body: form,
      });
    } catch (error) {
      console.log(error);
    }
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail('Verify your email', 'confrim-email', [
      { key: 'code', value: code },
      { key: 'username', value: email },
    ]);
  }
}
