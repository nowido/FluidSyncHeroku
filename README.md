# FluidSync

## Introduction

**FluidSync** is *a very simple* implementation of Publish/Subscribe pattern. It is node.js project hosted on Heroku platform.

Developers can access **FluidSync** service with **socket.io** [library](https://socket.io/).

For browser:

```
<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.4/socket.io.slim.js"></script>
```

For Node.js:

```
$npm install socket.io

... 

const io = require('socket.io-client');
```

‘Get started’ publisher code:

```
let socket = io('https://fluidsync2.herokuapp.com');
socket.on('connect', () => {
    socket.emit('publish', {channel: 'bar', from: 'foo', payload: 'Hello!'});
});
```

‘Get started’ subscriber code:

```
let socket = io('https://fluidsync2.herokuapp.com');
socket.on('connect', () => {
    socket.emit('subscribe', 'bar');
});
socket.on('bar', (message) => {               
    console.log(message);
});                       
```

## Why Heroku?

[Heroku](https://www.heroku.com) grants a generous free hosting. Verified accounts (credit card needed) get 1000 monthly *dyno* hours for absolutely free. So, **FluidSync** service runs 24 hours a day, accessible all over the world.

## FluidSync commands

FluidSync provides two main actions: *publish* and *subscribe*.

Publish takes an object with 3 members:

```
let message = 
{
    channel: <string; channel to publish on>, 
    from: <string; publisher id>, 
    payload: <Object; anything you want to publish>
};

socket.emit('publish', message);
```

Subscribe takes a string:

socket.emit('subscribe', <string; channel to listen on>);

FluidSync destroys client’s subscriptions when client socket is disconnected. Clients have to (re)subscribe on (re)connection. A good practice is to emit needed subscriptions on ‘connect’ event:

```
socket.on('connect', () => {
    socket.emit('subscribe', ...);
});
```

At present, **FluidSync** doesn’t support *arrays of channels* for multiple subscriptions in one ‘subscribe’ action. You need to emit ‘subscribe’ several times if you want to listen on several channels.

## FluidSync service is lightweight and almost stateless

**FluidSync** supports no buffering, no messages queueing, no feedback from the service itself. You have to implement your own protocol over it.

