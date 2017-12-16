const http = require('http');

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end('Hello World\n');
});

server.listen(process.env.PORT, () => {
  console.log('Server running...');
});
