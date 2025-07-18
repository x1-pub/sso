import { Configuration, App, Config, IMidwayContainer } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import { join } from 'path';
import * as sequelize from '@midwayjs/sequelize';
import * as redis from '@midwayjs/redis';
import { createTransport, Transporter } from 'nodemailer';
import { DefaultErrorFilter } from './filter/default.filter';
import * as cos from '@midwayjs/cos';
import { ReportMiddleware } from './middleware/report.middleware';

@Configuration({
  imports: [
    koa,
    validate,
    {
      component: info,
      enabledEnvironment: ['local'],
    },
    sequelize,
    redis,
    cos,
  ],
  importConfigs: [join(__dirname, './config')],
})
export class MainConfiguration {
  @App('koa')
  app: koa.Application;

  @Config('mail')
  mailConfig;

  async onReady(container: IMidwayContainer) {
    // add middleware
    this.app.useMiddleware([ReportMiddleware]);

    const transporter: Transporter = createTransport(this.mailConfig);
    container.registerObject('mailer', transporter);

    // add filter
    this.app.useFilter([DefaultErrorFilter]);
  }

  async onStop(container: IMidwayContainer) {
    const isMailer = container.hasObject('mailer');
    if (isMailer) {
      const mailer: Transporter = await container.getAsync('mailer');
      mailer?.close();
    }
  }
}
