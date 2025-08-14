const Doraemon = require('@x1.pub/doraemon')
const fs = require('fs')
const { app, secret } = require('./sensitive-config.json')

const prodService = new Doraemon({ app, secret, env: 'prod' })

async function main() {
  const prodRes = await prodService.GetData('server', 'sensitive')


  if (prodRes.code !== 0 || prodRes.data?.length !== 1) {
    throw new Error(prodRes.message || '获取 Prod Doraemon 敏感配置失败')
  }

  fs.writeFileSync('./doraemon.json', JSON.stringify(JSON.parse(prodRes.data[0].content)))
}

main()
