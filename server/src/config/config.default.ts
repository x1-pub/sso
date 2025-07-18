import { MidwayConfig } from '@midwayjs/core';

// @ts-ignore
import { mysql, redis, mail, cos } from '../../doraemon.json'

export default {
  domain: 'https://sso.x1.pub',
  keys: 'sso_x1_pub_2024_cloud',
  sessionName: 'sso_vo_pub_session',
  koa: {
    port: 7002,
    globalPrefix: '/api',
  },
  // mysql 配置
  sequelize: {
    dataSource: {
      default: {
        database: 'sso',
        ...mysql,
        encrypt: false,
        dialect: 'mysql',
        define: { charset: 'utf8' },
        timezone: '+08:00',
        sync: true, // 是否 createTable
        entities: ['entity', '**/entity/*.entity.{j,t}s'],
        logging: false,
      },
    },
  },
  // redis 配置
  redis: {
    client: {
      ...redis,
      db: 0,
    },
  },
  mail: {
    host: 'smtp.163.com',
    pool: true,
    secure: true,
    auth: {
      user: 'x1_mailer@163.com',
      ...mail,
    },
  },
  cors: {
    origin: '*',
  },
  cos: {
    client: {
      ...cos
    },
    bucket: 'sso-1251319111',
    region: 'ap-beijing',
  },
} as MidwayConfig;
