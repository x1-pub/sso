import { Inject, Controller, Post, Body, Config } from '@midwayjs/core';
import { ValidateService } from '@midwayjs/validate';
import { Context } from '@midwayjs/koa';

import { Business } from '../entity/business.entity';
import { AuthService } from '../service/auth.service';
import { BusinessRegisterDTO } from '../dto/business';
import { AuthSessionDTO, AuthTicketDTO, LogoutDTO, SearchUserDTO, UserListDTO } from '../dto/auth';
import res, { RspCode } from '../utils/res';
import { User } from '../entity/user.entity';
import { Op } from 'sequelize';

@Controller('/business')
export class BusinessService {
  @Inject()
  ctx: Context;

  @Inject()
  validateService: ValidateService;

  @Inject()
  authService: AuthService;

  @Config('domain')
  domain;

  @Post('/register')
  async sendEmailCaptcha(@Body() body: BusinessRegisterDTO) {
    const result = await new Business({ ...body }).save();
    return res({ data: result });
  }

  @Post('/auth/session')
  async auth(@Body() body: AuthSessionDTO) {
    const { sessionId, appId, appSecret, callbackUrl } = body;
    try {
      if (!sessionId) {
        throw new Error('session id 为空');
      }
      const userInfo = await this.authService.authBusinessSessionId(
        sessionId,
        appId,
        appSecret
      );
      return res({ data: userInfo });
    } catch (err) {
      return res({
        code: RspCode.AUTH_INVALID,
        message: err.message || '验证不通过',
        data: {
          loginUrl: `${
            this.domain
          }?appId=${appId}&callbackUrl=${encodeURIComponent(callbackUrl)}`,
        },
      });
    }
  }

  @Post('/auth/ticket')
  async authTicket(@Body() body: AuthTicketDTO) {
    const { ticket, appId, appSecret } = body;
    await this.authService.authTicket(ticket, appId, appSecret);
    const sessionId = await this.authService.createAndSaveBusinessSession(
      ticket,
      appId,
      appSecret
    );

    return res({
      data: { sessionId },
    });
  }

  @Post('/logout')
  async logout(@Body() body: LogoutDTO) {
    const { sessionId, appId, appSecret, callbackUrl } = body;

    const { id } = await this.authService.authBusinessSessionId(
      sessionId,
      appId,
      appSecret
    );
    await this.authService.clearRedisByUid(id);

    return res({
      data: {
        loginUrl: `${
          this.domain
        }?appId=${appId}&callbackUrl=${encodeURIComponent(callbackUrl)}`,
      },
    });
  }

  @Post('/search_user')
  async searchUser(@Body() body: SearchUserDTO) {
    const { sessionId, appId, appSecret, key } = body;

    await this.authService.authBusinessSessionId(
      sessionId,
      appId,
      appSecret
    );

    if (!key) {
      return res({ data: [] })
    }

    const like = `%${key}%`
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: like } },
          { nameCn: { [Op.like]: like } }
        ]
      },
      attributes: ['name', 'nameCn']
    });

    return res({
      data: users
    })
  }

  @Post('/user_list')
  async userList(@Body() body: UserListDTO) {
    const { sessionId, appId, appSecret,names } = body

    await this.authService.authBusinessSessionId(
      sessionId,
      appId,
      appSecret
    );

    if (!names || names.length === 0) {
      return res({ data: [] })
    }

    const users = await User.findAll({
      where: {
        name: {
          [Op.in]: names
        }
      },
      attributes: ['name', 'nameCn']
    });
    
    return res({
      data: users
    })
  }
}
