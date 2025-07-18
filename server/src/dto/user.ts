import { Rule, RuleType } from '@midwayjs/validate';

import { MailType } from '../utils/generate';

export class EmailDTO {
  @Rule(RuleType.string().required().email().error(new Error('邮箱格式错误')))
  email: string;

  @Rule(
    RuleType.string()
      .valid(...Object.values(MailType))
      .required()
      .error(new Error('验证码类型错误'))
  )
  type: MailType;
}

export class UserLoginDTO {
  @Rule(RuleType.string().required().email().error(new Error('邮箱格式错误')))
  email: string;

  @Rule(RuleType.string().length(6).required().error(new Error('验证码错误')))
  emailCaptcha: string;
}

export class UserRegisterDTO extends UserLoginDTO {
  @Rule(
    RuleType.string()
      .pattern(/^[a-z]{2,12}$/)
      .required()
      .error(new Error('英文名格式错误'))
  )
  name: string;

  @Rule(
    RuleType.string()
      .pattern(/^[\u4e00-\u9fa5]{1,6}$/)
      .required()
      .error(new Error('中文名格式错误'))
  )
  nameCn: string;
}
