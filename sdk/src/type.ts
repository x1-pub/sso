type Response<T> = Promise<{
  code: number,
  message?: string;
  data: T
}>

export interface SSOOptions {
  appId: string;
  appSecret: string;
}

interface AuthSessionIdAPIParams {
  sessionId: string;
  callbackUrl: string;
}

interface AuthSessionIdAPIData {
  loginUrl: string
}

interface AuthSessionIdSuccess {
  code: 0,
  message: string;
  data: {
    id: number;
    name: string;
    nameCn: string;
    email: string;
  }
}

interface AuthSessionIdFail {
  code: 10010,
  message: string;
  data: {
    loginUrl: string
  }
}

interface AuthSessionIdUnknown {
  code: number,
  message: string;
}

export interface AuthSessionIdAPI {
  (params: AuthSessionIdAPIParams): Promise<AuthSessionIdSuccess | AuthSessionIdFail | AuthSessionIdUnknown>
}

interface AuthTicketAPIParams {
  ticket: string;
}

interface AuthTicketAPIData {
  sessionId: string;
}

export interface AuthTicketAPI {
  (params: AuthTicketAPIParams): Response<AuthTicketAPIData>
}

interface SearchUserAPIParams {
  key: string;
  sessionId: string;
}

interface SearchUserAPIData {
  name: string;
  nameCn: string;
}

export interface SearchUserAPI {
  (params: SearchUserAPIParams): Response<SearchUserAPIData>
}
