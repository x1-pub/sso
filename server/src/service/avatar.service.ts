import { Provide, Inject, Config } from '@midwayjs/core';
import { COSService } from '@midwayjs/cos';
import * as sharp from 'sharp';
const multiavatar = require('@multiavatar/multiavatar');

@Provide()
export class AvatarService {
  @Inject()
  cosService: COSService;

  @Config('cos')
  cos;

  async generateAvatarAndUpload(name: string) {
    const svg = multiavatar(String(name));
    const png = await sharp(Buffer.from(svg)).png();
    const result = await this.cosService.putObject({
      Bucket: this.cos.bucket,
      Region: this.cos.region,
      Key: `${name}.png`,
      Body: png,
      Headers: {
        'Content-Disposition': 'inline',
      },
    });
    return result;
  }
}
