const path = require('path');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const common = require("./common/canvas");
//Server canvas (:
const {createCanvas} = require('canvas');
const canvas = createCanvas(2800, 2400);
const ctx = canvas.getContext('2d');

const connectedClientIDs = [];
const clientUsernames = [];

app.use(express.static(path.join(__dirname, '../client')));

// Define a route handler for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.use('/socket.io' ,express.static('client')); // Serve the client files
// console.log(app);
console.log(http);


io.on('connection', (socket) => {
  ctx.lineCap = "round";

  console.log("connecting");  
  socket.emit('loadCanvas', canvas.toDataURL())

  socket.on('draw', (data) => {

    common.draw(ctx, data.LastX, data.LastY, data.x, data.y, data.red, data.green, data.blue, data.linesize)
    socket.broadcast.emit('draw', data); // Broadcast to all other clients

  });

  socket.on('sentNameData', (data) => {

    if (clientUsernames.includes(data)) {

      socket.emit('nameConfirmed', {b: false, name: data});

    } else {
      socket.emit('nameConfirmed', {b: true, name: data});

      clientUsernames.push(data);
      connectedClientIDs.push(socket.id);
      userName = data;
      //currentConnectedClients.push(socket.id);

    }

  }); 

  // MY REPO IS BROKEN, UH GOTTA FIX MY NODE MODULE.


  socket.on('disconnect', (notUsed) => {
    let deleteAt = connectedClientIDs.indexOf(socket.id)
    if (deleteAt != -1)
    {
      clientUsernames.splice(deleteAt, 1);
      connectedClientIDs.splice(deleteAt, 1);
    }
  });
  socket.on('mouse', (data) => {

    socket.broadcast.emit('mouse', data); // Broadcast mouse movement (I MADE THIS ZELLA WATT)

  });
});

http.listen(3000, () => console.log('Server listening on port 3000'));
