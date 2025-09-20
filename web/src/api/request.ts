/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IParams {
  [key: string]: any;
}

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

enum Method {
  GET = "GET",
  POST = "POST",
}

// @ts-expect-error 后续补充 process
const prefix = process.env.NODE_ENV === "development" ? "/dev-api" : "";

const request = (url: string, method: Method, params: IParams = {}) => {
  url = `${prefix}${url}`;

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      credentials: "include",
    },
    redirect: 'follow',
  };

  if (method === Method.POST) {
    options.body = JSON.stringify(params);
  }
  if (method === Method.GET) {
    let qs = "";
    Object.keys(params).forEach((key) => {
      qs += `${key}=${params[key]}&`;
    });
    qs = qs.substring(0, qs.lastIndexOf("&"));
    url = `${url}?${qs}`;
  }

  return fetch(url, options).then((res) => res.json());
};

export const get = (url: string, params?: IParams) =>
  request(url, Method.GET, params);

export const post = (url: string, params?: IParams) =>
  request(url, Method.POST, params);
