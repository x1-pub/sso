import { post } from "./request";

export enum MailType {
  LOGIN = 'LOGIN',
  MODIFY = 'MODIFY',
  REGISTER = 'REGISTER',
}

interface SendEmailParams {
  type: MailType;
  email: string;
}
export const sendEmailCaptcha = (data: SendEmailParams) =>
  post("/api/user/email_captcha", data);

interface LoginParams {
  email: string;
  emailCaptcha: string;
}
export const login = (data: LoginParams) => post("/api/user/login", data);

export const logout = () => post("/api/user/sso_logout");

interface RegisterParams extends LoginParams {
  name: string;
  nameCn: string;
}
export const register = (data: RegisterParams) => post("/api/user/register", data);

export const ssoAuth = () => post("/api/user/check_sso_login");
