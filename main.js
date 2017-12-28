const http = require('http');
const socketServer = require('socket.io');

const PERIOD = 15 * 60 * 1000;
const pingTarget = 'fluidsync2.herokuapp.com';

const pingOptions = { hostname: pingTarget };

const httpServer = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end('OK ' + req.socket.remoteAddress);
  //res.end('OK');
});

const io = new socketServer(httpServer);

//----------------------------------------------------------------------

var registry = 
{
        // Map to store sockets subscribed for 'some channel'
    channels: new Map(),

        // Map to store channels socket 'socket.id' is subscribed to
        // (reverse registry to speed up cleanup when disconnect)
    socketsSubscriptions: new Map()
};

function registerSubscription(channelId, socketId)
{
    if((typeof channelId === 'string') && (channelId.length > 0))
    {
        // direct registry (channels -> sockets)

        addGeneral(registry.channels, channelId, socketId);

        // reverse registry (sockets -> channels)

        addGeneral(registry.socketsSubscriptions, socketId, channelId);
    }
}

function removeSubscription(channelId, socketId)
{
    if((typeof channelId === 'string') && (channelId.length > 0))
    {
        // direct registry (channels -> sockets)

        deleteGeneral(registry.channels, channelId, socketId);

        // reverse registry (sockets -> channels)

        deleteGeneral(registry.socketsSubscriptions, socketId, channelId);
    }
}

function addGeneral(mapObject, mapKey, elementOfSet)
{
    let entry = mapObject.get(mapKey);

    if(entry === undefined)
    {
        mapObject.set(mapKey, new Set([elementOfSet]));
    }
    else
    {
        entry.add(elementOfSet);
    }        
}

function deleteGeneral(mapObject, mapKey, elementOfSet)
{
    let entry = mapObject.get(mapKey);
    
    if(entry !== undefined)
    {
        entry.delete(elementOfSet);
        
        if(entry.size === 0)
        {
            mapObject.delete(mapKey);    
        }
    }
}

function removeAllSubscriptions(socketId)
{
    let socketsSubscriptions = registry.socketsSubscriptions;

    let socketChannels = socketsSubscriptions.get(socketId);

    if(socketChannels !== undefined)
    {
        let channels = registry.channels;

        socketChannels.forEach(channelId => {       
                 
            deleteGeneral(channels, channelId, socketId);
        });

        socketsSubscriptions.delete(socketId);
    }
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
    let socketId = socket.id;

    //console.log(socketId + ' connected');
    
    socket.on('subscribe', function(channelId){
        registerSubscription(channelId, socketId);    
    });

    socket.on('unsubscribe', function(channelId){
        removeSubscription(channelId, socketId);    
    });
    
    socket.on('publish', function (message) 
    {
      //console.log(message);
      
      publish(message);
    });
    
    socket.on('disconnect', function(reason){

      removeAllSubscriptions(socketId);    
      
      //console.log(socketId + ' disconnected by reason: ' + reason);        
    });        
});

setInterval(() => {
    const pingRequest = http.request(pingOptions);    
    pingRequest.end();
}, PERIOD);

httpServer.listen(process.env.PORT, () => {
  console.log('Server running...');
});
