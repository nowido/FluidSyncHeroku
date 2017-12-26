const http = require('http');
const socketServer = require('socket.io');

const PERIOD = 15 * 60 * 1000;
const pingTarget = 'fluidsync2.herokuapp.com';

const pingOptions = { hostname: pingTarget };

const httpServer = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end('OK');
});

const io = new socketServer(httpServer);

//----------------------------------------------------------------------

var registry = 
{
        // Map to store sockets subscribed for 'some channel'
    channels: new Map()
};

function registerSubscription(channelId, socketId)
{
    if((typeof channelId === 'string') && (channelId.length > 0))
    {
        let channels = registry.channels;

        let subscribers = channels.get(channelId);

        if(subscribers === undefined)
        {
            channels.set(channelId, new Set([socketId]));
        }
        else
        {
            subscribers.add(socketId);
        }            
    }
}

function removeSubscription(channelId, socketId)
{
    if((typeof channelId === 'string') && (channelId.length > 0))
    {
        let channels = registry.channels;

        let subscribers = channels.get(channelId);
        
        if(subscribers !== undefined)
        {
            subscribers.delete(socketId);

            if(subscribers.size === 0)            
            {
                channels.delete(channelId);
            }
        }
    }
}

function removeAllSubscriptions(socketId)
{
    let channels = registry.channels;

    let channelsToRemove = [];

    channels.forEach((subscribers, channelId) => {

        if(subscribers)
        {
            subscribers.delete(socketId);

            if(subscribers.size === 0)
            {
                channelsToRemove.push(channelId);
            }
        }        
    });

    channelsToRemove.forEach(channelId => {

        channels.delete(channelId);
    });
}

function publish(message)
{
    let channelId = message.channel;

    if((typeof channelId === 'string') && (channelId.length > 0))
    {
        let subscribers = registry.channels.get(channelId);

        if(subscribers !== undefined)
        {
            let allSockets = io.sockets.sockets;
            
            subscribers.forEach(socketId => {

                let socket = allSockets[socketId];

                if(socket)
                {
                    socket.emit(channelId, message);
                }                
            });
        }
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
