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

export interface AuthSessionIdAPI {
  (params: AuthSessionIdAPIParams): Response<AuthSessionIdAPIData>
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
