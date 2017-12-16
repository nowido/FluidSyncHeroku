import { setInterval } from 'timers';

const http = require('http');

const PERIOD = 10 * 1000;
const pingTarget = 'fluidsync2.herokuapp.com';

const pingOptions = 
{
    hostname: pingTarget//,
    //port: process.env.PORT
};

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end('Hello World\n');
});

setInterval(() => {

    const pingRequest = http.request(pingOptions, (res) => {
        console.log('!!');
    });
    
    pingRequest.end();

}, PERIOD);

server.listen(process.env.PORT, () => {
  console.log('Server running...');
});
