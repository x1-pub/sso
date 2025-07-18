import { Provide, Inject } from '@midwayjs/core';
import { Transporter } from 'nodemailer';
import { RedisService } from '@midwayjs/redis';

import mailTemplate from '../utils/mail-template';
import {
  generateRandomCode,
  generateMailRedisKey,
  MailType,
} from '../utils/generate';

@Provide()
export class CaptchaService {
  @Inject()
  mailer: Transporter;

  @Inject()
  redisService: RedisService;

  async sendMailCaptcha(type: MailType, email: string): Promise<string> {
    try {
      const code = generateRandomCode(6);
      const r = await this.mailer.sendMail({
        from: 'X1开放平台<x1_mailer@163.com>',
        to: email,
        subject: 'X1开放平台验证服务',
        html: mailTemplate(code, 5),
      });

      if (r.messageId) {
        const redisKey = generateMailRedisKey(type, email);
        await this.redisService.set(redisKey, code, 'EX', 5 * 60);
        return;
      }

      throw new Error('发送验证码失败');
    } catch (err) {
      throw new Error(JSON.stringify(err));
    }
  }

  async authMailCaptcha(type: MailType, email: string, code: string) {
    const redisKey = generateMailRedisKey(type, email);
    const result = await this.redisService.get(redisKey);
    if (String(result) === String(code)) {
      await this.redisService.del(redisKey);
      return;
    }

    throw new Error('验证码错误');
  }
}
