import { Catch, MidwayHttpError, Config } from '@midwayjs/core';
import { RspCode } from '../utils/res';

@Catch()
export class DefaultErrorFilter {
  @Config('koa')
  koaConfig;

  async catch(err: Error) {
    const code = Number(
      (err as MidwayHttpError).status ||
        (err as MidwayHttpError).code ||
        RspCode.UNKNOW_ERROR
    );
    return {
      code,
      message: err.message || '服务器发生错误',
    };
  }
}
