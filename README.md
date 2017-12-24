# FluidSync

## Introduction

**FluidSync** is Node.js implementation of Publish/Subscribe concept. It is hosted on Heroku platform.

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
socket.emit('publish', 
{channel: 'bar', from: 'foo', payload: 'Hello!'});
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

Heroku grants a generous free hosting. Verified accounts (credit card needed) get 1000 monthly hours for free. So, your project can run 24 hours a day. 

A little trick needed to get your *dyno* always on, because a free *dyno* goes to sleep when it doesn’t receive web traffic for a period longer than half an hour. To prevent *dyno* from sleep we can provide ‘ping’ traffic from inside its own process, on timer.





