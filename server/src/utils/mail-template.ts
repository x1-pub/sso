/**
 * 生成邮件模版
 * @param code 验证码文案
 * @param expires 有效时间文案
 * @returns html
 */
const mailTemplate = (code: string, expires = 5) => `
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
          @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
          }
          @keyframes slideIn {
              from { transform: translateY(-20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
          }
          .animate-fade-in {
              animation: fadeIn 1s ease-out;
          }
          .animate-slide-in {
              animation: slideIn 0.5s ease-out;
          }
      </style>
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f0f0f0;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
              <td align="center" style="padding: 40px 0;">
                  <table role="presentation" style="width: 600px; border-collapse: collapse; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); overflow: hidden;" class="animate-fade-in">
                      <!-- Header -->
                      <tr>
                          <td style="padding: 40px 30px; text-align: center;">
                              <h1 style="color: #ffffff; font-size: 32px; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);" class="animate-slide-in">验证你的身份</h1>
                          </td>
                      </tr>
                      <!-- Content -->
                      <tr>
                          <td style="padding: 20px 30px 40px;">
                              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: rgba(255, 255, 255, 0.9); border-radius: 12px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);">
                                  <tr>
                                      <td style="padding: 30px;">
                                          <p style="font-size: 18px; line-height: 28px; margin: 0 0 20px 0; color: #333333; text-align: center;">您的专属验证码是：</p>
                                          <p style="font-size: 42px; font-weight: bold; text-align: center; margin: 30px 0; padding: 20px; background: linear-gradient(45deg, #11998e, #38ef7d); border-radius: 8px; letter-spacing: 8px; color: #ffffff; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);" class="animate-slide-in">${code}</p>
                                          <p style="font-size: 16px; line-height: 24px; margin: 0 0 20px 0; color: #666666; text-align: center;">此验证码将在 <strong style="color: #11998e;">${expires}分钟</strong> 内有效。</p>
                                          <p style="font-size: 14px; line-height: 20px; margin: 0; color: #999999; text-align: center;">请勿将验证码泄露给他人。如果您没有请求此验证码，请忽略此邮件。</p>
                                      </td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                      <!-- Footer -->
                      <tr>
                          <td style="padding: 30px; text-align: center;">
                              <p style="font-size: 14px; color: rgba(255, 255, 255, 0.8); margin: 0;">安全由 <strong style="color: #ffffff;">x1.pub</strong> 提供技术支持</p>
                          </td>
                      </tr>
                  </table>
              </td>
          </tr>
      </table>
  </body>
  </html>
`;
export default mailTemplate;
