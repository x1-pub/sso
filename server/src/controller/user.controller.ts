import {
  Inject,
  Controller,
  Post,
  Body,
  Config,
  MidwayError,
} from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

import { User } from '../entity/user.entity';
import { EmailDTO, UserLoginDTO, UserRegisterDTO } from '../dto/user';
import { CaptchaService } from '../service/captcha.service';
import { AuthService } from '../service/auth.service';
import { AvatarService } from '../service/avatar.service';
import { MailType } from '../utils/generate';
import res, { RspCode } from '../utils/res';

@Controller('/user')
export class PersonService {
  @Inject()
  ctx: Context;

  @Inject()
  captchaService: CaptchaService;

  @Inject()
  authService: AuthService;

  @Inject()
  avatarService: AvatarService;

  @Config('sessionName')
  sessionName: string;

  @Post('/email_captcha')
  async sendEmailCaptcha(@Body() body: EmailDTO) {
    const { email, type } = body;
    const userAuthEmail = await User.findOne({ where: { email } });

    if ([MailType.LOGIN, MailType.MODIFY].includes(type)) {
      if (!userAuthEmail) {
        throw new Error('该邮箱尚未注册');
      }
    }

    if (type === MailType.REGISTER) {
      if (userAuthEmail) {
        throw new Error('该邮箱已注册');
      }
    }

    await this.captchaService.sendMailCaptcha(body.type, body.email);

    return res();
  }

  @Post('/login')
  async login(@Body() body: UserLoginDTO) {
    const { business, callbackUrl } = await this.authService
      .authURL()
      .catch(() => {
        return Promise.reject('URL中参数错误');
      });

    const { appId, appSecret } = business;
    const { emailCaptcha, email } = body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('该邮箱尚未注册');
    }

    await this.captchaService.authMailCaptcha(
      MailType.LOGIN,
      email,
      emailCaptcha
    );

    const { receiveTicketUrl } = business;
    const sessionId = await this.authService.createAndSaveSSOSession(
      user.id,
      user.name,
      user.nameCn,
      user.email,
      appId,
      appSecret
    );
    const ticket = await this.authService.createAndSaveTicket(
      sessionId,
      appId,
      appSecret
    );
    this.ctx.cookies.set(this.sessionName, sessionId, {
      maxAge: 1000 * 60 * 60 * 24,
    });

    return res({
      data: `${receiveTicketUrl}?callbackUrl=${callbackUrl}&ticket=${ticket}`,
    });
  }

  @Post('/register')
  async register(@Body() body: UserRegisterDTO) {
    const { business, callbackUrl } = await this.authService.authURL();

    const { appId, appSecret } = business;
    const { email, emailCaptcha, name, nameCn } = body;

    const userAuthName = await User.findOne({ where: { name } });
    if (userAuthName) {
      throw new Error('英文名重复');
    }
    const userAuthEmail = await User.findOne({ where: { email } });
    if (userAuthEmail) {
      throw new Error('该邮箱已注册');
    }

    const tr = await User.sequelize.transaction();

    try {
      const { id } = await new User({ name, nameCn, email }).save({
        transaction: tr,
      });
      await this.captchaService.authMailCaptcha(
        MailType.REGISTER,
        email,
        emailCaptcha
      );
      await this.avatarService.generateAvatarAndUpload(name);
      const sessionId = await this.authService.createAndSaveSSOSession(
        id,
        name,
        nameCn,
        email,
        appId,
        appSecret
      );
      const ticket = await this.authService.createAndSaveTicket(
        sessionId,
        appId,
        appSecret
      );
      this.ctx.cookies.set(this.sessionName, sessionId, {
        maxAge: 1000 * 60 * 60 * 24,
      });
      await tr.commit();
      return res({
        code: 0,
        data: `${business.receiveTicketUrl}?callbackUrl=${callbackUrl}&ticket=${ticket}`,
      });
    } catch (err) {
      await tr.rollback();
      throw new Error(err);
    }
  }

  @Post('/check_sso_login')
  async ssoAuth() {
    const { business, callbackUrl } = await this.authService.authURL();
    const { appId, appSecret, receiveTicketUrl } = business;
    const sessionId = this.ctx.cookies.get(this.sessionName);
    if (!sessionId) {
      throw new MidwayError('未登录', String(RspCode.AUTH_INVALID));
    }

    const { name, nameCn, email } = await this.authService.authSSOSessionId(
      sessionId
    );

    const ticket = await this.authService.createAndSaveTicket(
      sessionId,
      appId,
      appSecret
    );

    return res({
      data: {
        url: `${receiveTicketUrl}?callbackUrl=${callbackUrl}&ticket=${ticket}`,
        name,
        nameCn,
        email,
      },
    });
  }

  @Post('/sso_logout')
  async logout() {
    await this.authService.authURL();

    const sessionId = this.ctx.cookies.get(this.sessionName);
    if (!sessionId) {
      throw new MidwayError('未登录', String(RspCode.AUTH_INVALID));
    }

    const { id } = await this.authService.authSSOSessionId(sessionId);

    await this.authService.clearRedisByUid(id);
    this.ctx.cookies.set(this.sessionName, { maxAge: 0 });

    return res();
  }
}
