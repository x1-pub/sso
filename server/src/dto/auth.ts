import { Rule, RuleType } from '@midwayjs/validate';

export class AuthSessionDTO {
  @Rule(RuleType.string())
  sessionId: string;

  @Rule(RuleType.string().required())
  appId: string;

  @Rule(RuleType.string().required())
  appSecret: string;

  @Rule(RuleType.string().required())
  callbackUrl: string;
}

export class AuthTicketDTO {
  @Rule(RuleType.string().required())
  ticket: string;

  @Rule(RuleType.string().required())
  appId: string;

  @Rule(RuleType.string().required())
  appSecret: string;
}

export class LogoutDTO {
  @Rule(RuleType.string().required())
  sessionId: string;

  @Rule(RuleType.string().required())
  callbackUrl: string;

  @Rule(RuleType.string().required())
  appId: string;

  @Rule(RuleType.string().required())
  appSecret: string;
}

export class SearchUserDTO {
  @Rule(RuleType.string().required())
  sessionId: string;

  @Rule(RuleType.string().required())
  appId: string;

  @Rule(RuleType.string().required())
  appSecret: string;

  @Rule(RuleType.string().empty(''))
  key: string;
}

export class UserListDTO {
  @Rule(RuleType.string().required())
  sessionId: string;

  @Rule(RuleType.string().required())
  appId: string;

  @Rule(RuleType.string().required())
  appSecret: string;

  @Rule(RuleType.array().items(RuleType.string()))
  names: string[];
}
