var http = require('http')
var server = http.createServer(function(req, res) {
  // res.setHeader('Content-Encoding', 'gzip')
  res.setHeader('Content-Type', 'application/json')
  res.removeHeader('Accept-Encoding')
  req.pipe(res)
})
server.listen(3000)
