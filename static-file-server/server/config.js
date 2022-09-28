const path = require('path')
module.exports = {
  root: path.join(process.cwd(), '../release/2.0.2'),
  host: '127.0.0.1',
  port: '8877',
  compress: /\.(html|js|css|md)/,
  cache: {
    maxAge: 2,
    expires: true,
    cacheControl: true,
    lastModified: true,
    etag: true
  }
}