import { Inject, Controller, Post, Body, Config, Get, Headers, Query } from '@midwayjs/core';
import { ValidateService } from '@midwayjs/validate';
import { Context } from '@midwayjs/koa';

import { Business } from '../entity/business.entity';
import { AuthService } from '../service/auth.service';
import { BusinessRegisterDTO } from '../dto/business';
import { LogoutDTO, SearchUserDTO, UserListDTO } from '../dto/auth';
import res from '../utils/res';
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

  @Get('/auth/session')
  async auth(@Headers('app-id') appId: string, @Headers('authorization') authorization: string, @Headers('app-secret') appSecret: string) {
    try {
      if (!authorization) {
        throw new Error('session id 为空');
      }
      const userInfo = await this.authService.authBusinessSessionId(
        authorization,
        appId,
        appSecret
      );
      this.ctx.set({ 'sso_user_id' : String(userInfo.id) })
      this.ctx.status = 200
    } catch (err) {
      this.ctx.status = 401;
    }
  }

  @Get('/auth/ticket')
  async authTicket(@Query('ticket') ticket: string, @Query('callbackUrl') callbackUrl: string, @Headers('app-id') appId: string, @Headers('app-secret') appSecret: string) {
    const userId = await this.authService.authTicket(ticket, appId, appSecret);
    const sessionId = await this.authService.createAndSaveBusinessSession(
      ticket,
      appId,
      appSecret
    );
    this.ctx.set({ 'sso_session_id': sessionId })
    this.ctx.set({ 'sso_user_id' : userId })
    this.ctx.redirect(callbackUrl)
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
