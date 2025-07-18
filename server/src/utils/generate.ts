import * as CryptoJS from 'crypto-js';

const SSO_SESSION_REDIS_KEY_PREFIX = 'SSO:';
const BUSINESS_SESSION_REDIS_KEY_PREFIX = 'BUSINESS:';
const TICKEY_PREFIX = 'TICKET:';
const MAIL_REDIS_KEY_PREFIX = 'MAIL:';
const ID_SECRET_KEY = 'sso_1900_secret_uu';

/**
 * 加密: uid -> sso session id -> ticket -> business session id
 * @param id
 * @returns
 */
export const encryptId = (id: string) => {
  const encrypted = CryptoJS.AES.encrypt(id, ID_SECRET_KEY);
  return encrypted.toString();
};

/**
 * 解密: business session id -> ticket -> sso session id -> uid
 * @param encryptedId
 * @returns
 */
export const decryptId = (encryptedId: string) => {
  const bytes = CryptoJS.AES.decrypt(encryptedId, ID_SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

/**
 * 生成 Redis key: 存储 SSO 系统 session id
 * @param uid 用户id
 * @param sid session id
 * @returns
 */
export const generateSSOSessionRedisKey = (
  uid: string | number,
  sid: string
) => {
  return `${SSO_SESSION_REDIS_KEY_PREFIX}${uid}:${sid}`;
};

/**
 * 生成业务方系统的 session key
 * @param id 用户id
 * @param bsid 业务方系统的 session id
 * @returns
 */
export const generateBusinessSessionRedisKey = (
  uid: string | number,
  bsid: string
) => {
  return `${BUSINESS_SESSION_REDIS_KEY_PREFIX}${uid}:${bsid}`;
};

/**
 * 生成 ticket 的 session key
 * @param uid 用户id
 * @param ticket
 * @returns
 */
export const generateTicketRedisKey = (
  uid: string | number,
  ticket: string
) => {
  return `${TICKEY_PREFIX}${uid}:${ticket}`;
};

export enum MailType {
  LOGIN = 'LOGIN',
  MODIFY = 'MODIFY',
  REGISTER = 'REGISTER',
}
/**
 * 生成邮箱验证码的 key
 * @param id 唯一 id
 * @returns
 */
export const generateMailRedisKey = (type: MailType, email: string) => {
  return `${MAIL_REDIS_KEY_PREFIX}${type}:${email}`;
};

/**
 * 生成指定位数的随机数字验证码
 * @param length 验证码长度
 * @returns
 */
export const generateRandomCode = (length = 6): string => {
  let code = '';
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  const randomNum = Math.floor(Math.random() * (max - min + 1) + min);
  code = randomNum.toString().padStart(length, '0');
  return code;
};
