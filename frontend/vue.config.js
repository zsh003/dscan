const fs = require('fs')
const path = require('path')

module.exports = {
  devServer: {
    https: {
      key: fs.readFileSync(path.join(__dirname, '../certificate/localhost.key')),
      cert: fs.readFileSync(path.join(__dirname, '../certificate/localhost.crt')),
    },
    port: 8080
  }
} 