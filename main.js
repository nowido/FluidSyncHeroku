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

//----------------------------------------------------------------------

var registry = 
{
        // dictionary to store sockets subscribed for 'some çhannel'
    channels: {}
};

function registerSubscription(channelId, socketId)
{
    let channels = registry.channels;

    let entry = channels[channelId];

    if(entry === undefined)
    {
        entry = channels[channelId] = {};
    }

    entry[socketId] = true;
}

function removeSubscription(channelId, socketId)
{
    let channels = registry.channels;

    let entry = channels[channelId];

    if(entry !== undefined)
    {
        delete entry[socketId];
    }
}

function removeAllSubscriptions(socketId)
{
    let channels = registry.channels;

    let channelsIds = Object.keys(channels);

    let count = channelsIds.length;

    for(let i = 0; i < count; ++i)
    {
        let channelId = channelsIds[i];

        let entry = channels[channelId];

        delete entry[socketId];                
    }
}

function publish(message)
{
    let channelId = message.channel;
    
    let subscribers = registry.channels[channelId];

    if(subscribers === undefined)
    {
        return;
    }

    let socketsIds = Object.keys(subscribers);

    let count = socketsIds.length;
    
    let allSockets = io.sockets.sockets;

    for(let i = 0; i < count; ++i)
    {
        let socketId = socketsIds[i];

        let socket = allSockets[socketId];

        socket.emit(channelId, message);
    }
}

//----------------------------------------------------------------------

io.on('connection', function (socket) 
{    
    //console.log(socket.id + ' connected');

    socket.on('subscribe', function(channelId){
        registerSubscription(channelId, socket.id);    
    });

    socket.on('unsubscribe', function(channelId){
        removeSubscription(channelId, socket.id);    
    });
    
    socket.on('publish', function (message) 
    {
      //console.log(message);
      
      publish(message);
    });
    
    socket.on('disconnect', function(reason){

      removeAllSubscriptions(socket.id);    
      
      //console.log(socket.id + ' disconnected by reason: ' + reason);        
    });        
});

setInterval(() => {
    const pingRequest = http.request(pingOptions);    
    pingRequest.end();
}, PERIOD);

httpServer.listen(process.env.PORT, () => {
  console.log('Server running...');
});
