import { UNKNOWN_ERROR_CODE, AUTH_TICKET_FAIL_CODE, NEED_RE_LOGIN_CODE, HOST } from './constants'
import type { AuthSessionIdAPI, AuthTicketAPI, SearchUserAPI, SSOOptions } from './type'

class Server {
  private appId: string
  private appSecret: string

  constructor(options: SSOOptions) {
    this.appId = options.appId
    this.appSecret = options.appSecret
  }

  AuthSessionId: AuthSessionIdAPI = async (params) => {
    try {
      const response = await fetch(`${HOST}/api/business/auth/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appId: this.appId,
          appSecret: this.appSecret,
          sessionId: params.sessionId,
          callbackUrl: params.callbackUrl,
        })
      })
      return response.json() as any
    } catch (err) {
      return {
        code: UNKNOWN_ERROR_CODE,
        message: (err as Error).message || '未知错误',
        data: {
          loginUrl: ''
        }
      }
    }
  }

  AuthTicket: AuthTicketAPI = async (params) => {
    try {
      const response = await fetch(`${HOST}/api/business/auth/ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appId: this.appId,
          appSecret: this.appSecret,
          ticket: params.ticket,
        })
      })
      const result = await response.json() as any
      return {
        ...result,
        code: result.code !== 0 ? AUTH_TICKET_FAIL_CODE : 0
      }
    } catch (err) {
      return {
        code: UNKNOWN_ERROR_CODE,
        message: (err as Error).message || '未知错误',
        data: {
          loginUrl: ''
        }
      }
    }
  }

  SearchUser: SearchUserAPI = async (params) => {
    try {
      const response = await fetch(`${HOST}/api/business/search_user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appId: this.appId,
          appSecret: this.appSecret,
          key: params.key,
          sessionId: params.sessionId,
        })
      })
      const result = await response.json() as any
      return {
        ...result,
        code: result.code !== 0 ? AUTH_TICKET_FAIL_CODE : 0
      }
    } catch (err) {
      return {
        code: UNKNOWN_ERROR_CODE,
        message: (err as Error).message || '未知错误',
        data: {
          loginUrl: ''
        }
      }
    }
  }
}

export { Server, UNKNOWN_ERROR_CODE, NEED_RE_LOGIN_CODE, AUTH_TICKET_FAIL_CODE }
