import { Middleware, IMiddleware } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/koa';

@Middleware()
export class ReportMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {

      const start = Date.now();
      const requestLog = {
        timestamp: new Date().toISOString(),
        type: 'REQUEST',
        method: ctx.method,
        url: ctx.url,
        path: ctx.path,
        query: ctx.query,
        body: ctx.request.body,
        headers: ctx.headers,
        ip: ctx.ip,
      };

      ctx.logger.info('[REQUEST]', JSON.stringify(requestLog));

      try {
        await next();
      } catch (error) {
        ctx.logger.error('[REQUEST ERROR]', {
          error: error.message,
          stack: error.stack,
        });
        throw error;
      } finally {
        const duration = Date.now() - start;
        const responseLog = {
          timestamp: new Date().toISOString(),
          type: 'RESPONSE',
          status: ctx.status,
          duration: `${duration}ms`,
          response: ctx.body,
        };

        ctx.logger.info('[RESPONSE]', JSON.stringify(responseLog));
      }
    };
  }

  static getName(): string {
    return 'report';
  }
}
