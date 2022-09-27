const http = require('http')
const path = require('path')

const config = require('./config')
const route = require('./route')

const server = http.createServer((request, response) => {
  let filePath = path.join(config.root, request.url.split('?')[0])
  route(request, response, filePath)
})

server.listen(config.port, config.host, () => {
  const addr = `http://${config.host}:${config.port}`
  console.info(`server started at ${addr}`)
})