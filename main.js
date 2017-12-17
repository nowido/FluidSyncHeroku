const http = require('http');
const socketServer = require('socket.io');

const PERIOD = 15 * 60 * 1000;
const pingTarget = 'fluidsync2.herokuapp.com';

const pingOptions = { hostname: pingTarget };

const httpServer = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end('Hello World\n');
});

const io = new socketServer(httpServer);

//var registry = {};

io.on('connection', function (socket) 
{
    //registry[socket.id] = {};
    console.log(socket.id + ' connected');
    //console.log(io.sockets);

    socket.on('send', function (message) 
    {
      console.log(message);

      /*
      let count = io.sockets.length;

      for(let i = 0; i < count; ++i)
      {
        if(io.sockets[i].id !== socket.id)
        {
          io.sockets[i].emit(message.to, {from: message.from, payload: message.payload});
        }
      }      
      */

      io.emit(message.to, {from: message.from, payload: message.payload});
    });

    //*
    socket.on('disconnect', function(reason){

      //delete registry[socket.id];
      console.log(socket.id + ' disconnected by reason: ' + reason);        
    });    
    //*/
});

setInterval(() => {
    const pingRequest = http.request(pingOptions);    
    pingRequest.end();
}, PERIOD);

httpServer.listen(process.env.PORT, () => {
  console.log('Server running...');
});
