import { Provide, Inject, MidwayError } from '@midwayjs/core';
import { RedisService } from '@midwayjs/redis';
import { Context } from '@midwayjs/koa';

import {
  generateSSOSessionRedisKey,
  generateTicketRedisKey,
  generateBusinessSessionRedisKey,
  encryptId,
  decryptId,
} from '../utils/generate';
import { Business } from '../entity/business.entity';
import { User } from '../entity/user.entity';
import { RspCode } from '../utils/res';

@Provide()
export class AuthService {
  @Inject()
  redisService: RedisService;

  @Inject()
  ctx: Context;

  /**
   * 创建并储存 SSO 系统的 session
   * @param data
   * @returns sessionId
   */
  async createAndSaveSSOSession(
    uid: number | string,
    name: string,
    nameCn: string,
    email: string,
    appId: string,
    appSecret: string
  ) {
    const sessionId = encryptId(String(uid));
    const redisKey = generateSSOSessionRedisKey(uid, sessionId);
    await this.redisService.set(
      redisKey,
      JSON.stringify({ appId, appSecret, name, nameCn, email, id: uid }),
      'EX',

      7 * 24 * 60 * 60
    );
    return sessionId;
  }

  /**
   * 验证 SSO 系统的 session id
   * @param sessionId
   * @param appId
   * @param appSecret
   * @returns
   */
  async authSSOSessionId(sessionId: string) {
    const uid = decryptId(sessionId);
    const ssoRedisKey = generateSSOSessionRedisKey(uid, sessionId);
    const sessionStr = await this.redisService.get(ssoRedisKey);
    if (!sessionStr) {
      throw new MidwayError('登录过期', String(RspCode.AUTH_INVALID));
    }

    const session = JSON.parse(sessionStr);
    return session as {
      name: string;
      nameCn: string;
      email: string;
      id: number;
    };
  }

  /**
   * 创建并储存 ticket (2分钟有效期，换取成业务方 session 后失效)
   * @param sessionId
   * @param appId
   * @param appSecret
   * @returns
   */
  async createAndSaveTicket(
    sessionId: string,
    appId: string,
    appSecret: string
  ) {
    const uid = decryptId(sessionId);
    const ticket = encryptId(sessionId);
    const redisKey = generateTicketRedisKey(uid, ticket);
    await this.redisService.set(
      redisKey,
      JSON.stringify({ appId, appSecret }),
      'EX',
      60 * 2
    );
    return ticket;
  }

  /**
   * 验证 ticket
   * @param ticket
   * @returns
   */
  async authTicket(ticket: string, appId: string, appSecret: string) {
    const pureTicket = ticket.replace(/\s/g, '+');
    const sessionId = decryptId(pureTicket);
    const userId = decryptId(sessionId);
    const redisKey = generateTicketRedisKey(userId, pureTicket);
    const result = await this.redisService.get(redisKey);
    if (!result) {
      throw new Error('ticket不存在');
    }
    const { appId: ssoAppId, appSecret: ssoAppSecret } = JSON.parse(result);
    if (ssoAppId !== appId || ssoAppSecret !== appSecret) {
      throw new Error('非法的ticket');
    }
    this.redisService.del(redisKey);
  }

  /**
   * 创建并存储业务方系统的 session id
   * @param ticket
   * @param appId
   * @returns
   */
  async createAndSaveBusinessSession(
    ticket: string,
    appId: string,
    appSecret: string
  ) {
    const pureTicket = ticket.replace(/\s/g, '+');
    const sessionId = decryptId(pureTicket);
    const uid = decryptId(sessionId);
    const businessSessionId = encryptId(pureTicket);

    const redisKey = generateBusinessSessionRedisKey(uid, businessSessionId);
    const { id, name, nameCn, email } = await User.findByPk(uid);
    await this.redisService.set(
      redisKey,
      JSON.stringify({ id, name, nameCn, email, appId, appSecret }),
      'EX',
      24 * 60 * 60
    );
    return businessSessionId;
  }

  /**
   * 验证业务方系统的 session id
   * @param sessionId
   * @param appId
   * @returns
   */
  async authBusinessSessionId(
    businessSessionId: string,
    appId: string,
    appSecret: string
  ) {
    const ticket = decryptId(businessSessionId);
    const ssoSessionId = decryptId(ticket);
    const uid = decryptId(ssoSessionId);
    const redisKey = generateBusinessSessionRedisKey(uid, businessSessionId);
    const session = await this.redisService.get(redisKey);
    if (!session) {
      throw new Error('非法的 session');
    }
    const {
      id,
      name,
      nameCn,
      email,
      appId: ssoAppId,
      appSecret: ssoAppSecret,
    } = JSON.parse(session);
    if (appId !== ssoAppId || appSecret !== ssoAppSecret) {
      throw new Error('非法的 session');
    }
    return { id, name, nameCn, email } as {
      name: string;
      nameCn: string;
      email: string;
      id: number;
    };
  }

  // /**
  //  * 单点退出
  //  * @param businessSessionId
  //  * @param appId
  //  * @param appSecret
  //  */
  // async logout(businessSessionId: string, appId: string, appSecret: string) {
  //   const ticket = decryptId(businessSessionId);
  //   const sessionId = decryptId(ticket);
  //   const uid = decryptId(sessionId);

  //   const businessSessionRedisKey = generateBusinessSessionRedisKey(
  //     uid,
  //     businessSessionId
  //   );
  //   const businessSession = await this.redisService.get(
  //     businessSessionRedisKey
  //   );
  //   const { appId: ssoAppId, appSecret: ssoAppSecret } =
  //     JSON.parse(businessSession);
  //   if (appId !== ssoAppId || appSecret !== ssoAppSecret) {
  //     throw new Error('非法请求');
  //   }

  //   this.clearRedisByUid(uid)
  // }

  /**
   * 清除用户的所有 redis
   * @param uid 用户 id
   */
  async clearRedisByUid(uid: string | number) {
    const bskey = generateBusinessSessionRedisKey(uid, '*');
    const tkey = generateTicketRedisKey(uid, '*');
    const sid = generateSSOSessionRedisKey(uid, '*');

    const pipe = this.redisService.pipeline();
    pipe.keys(bskey).keys(tkey).keys(sid);
    const [[_1, k1], [_2, k2], [_3, k3]] = await pipe.exec();
    const keys = [
      ...(k1 as string[]),
      ...(k2 as string[]),
      ...(k3 as string[]),
    ];

    await this.redisService.del(...keys);
  }

  /**
   * 验证 SSO 系统 URL 的合法性
   * @returns
   */
  async authURL() {
    const { referer, origin } = this.ctx.header;
    const params = referer.slice(origin.length);
    const [, , appId, callbackUrl] =
      params.match(/^\/(login|register)\?appId=(.*?)&callbackUrl=(.*)$/) || [];
    if (!appId || !callbackUrl) {
      throw new MidwayError(
        'URL 中参数 appId 与 callbackUrl 不能为空',
        String(RspCode.SSO_URL_ERROR)
      );
    }

    const business = await Business.findOne({ where: { appId } });
    if (!business) {
      throw new MidwayError(
        `业务方 '${appId}' 不存在`,
        String(RspCode.SSO_URL_ERROR)
      );
    }

    // 有 domain 则进行验证
    if (business.domain) {
      const { origin, port } = new URL(callbackUrl);
      if (/^http(s)?:\/\//.test(business.domain)) {
        if (origin !== business.domain) {
          throw new MidwayError(
            'URL 中的参数 appId 与 callbackUrl 不匹配',
            String(RspCode.SSO_URL_ERROR)
          );
        }
      } else {
        if (`${origin}:${port}` !== business.domain) {
          throw new MidwayError(
            'URL 中的参数 appId 与 callbackUrl 不匹配',
            String(RspCode.SSO_URL_ERROR)
          );
        }
      }
    }

    return { business, callbackUrl };
  }
}
