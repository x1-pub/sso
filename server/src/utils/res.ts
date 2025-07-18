import { IResOption } from '../interface';

export enum RspCode {
  // 成功
  SUCCESS = 0,

  // SSO 系统 URL 参数错误
  SSO_URL_ERROR = 10001,

  // sessin 验证不通过
  AUTH_INVALID = 10010,

  // 未知错误
  UNKNOW_ERROR = 11000,
}

const res = (op?: IResOption): IResOption => ({
  code: op?.code ?? 0,
  data: op?.data ?? null,
  message: op?.code ? op?.message || '未知错误' : '请求成功',
});

export default res;
