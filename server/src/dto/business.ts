import { Rule, RuleType } from '@midwayjs/validate';

export class BusinessRegisterDTO {
  @Rule(RuleType.string().max(20).min(1).required())
  nameCn: string;

  @Rule(
    RuleType.string()
      .pattern(/^[a-zA-Z][a-zA-Z0-9_]{0,29}$/)
      .required()
  )
  appId: string;

  @Rule(
    RuleType.string()
      .pattern(/^http(s)?:\/\//)
      .required()
  )
  receiveTicketUrl: string;

  @Rule(RuleType.string())
  domain: string;

  @Rule(RuleType.string())
  description: string;
}

export class BusinessAuthDTO {
  @Rule(RuleType.number().required())
  id: number;

  @Rule(RuleType.string().required())
  secretKey: string;
}
