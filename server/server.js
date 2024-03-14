const path = require('path');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
//Server canvas (:
const {createCanvas} = require('canvas');
const canvas = createCanvas(2800, 2400);
const ctx = canvas.getContext('2d');

let userName;
const clientUsernames = [];

app.use(express.static(path.join(__dirname, '../client')));

// Define a route handler for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.use('/socket.io' ,express.static('client')); // Serve the client files
// console.log(app);
console.log(http);


io.on('connection', (socket) => {
  ctx.lineCap = "round";

  console.log("connecting");  
  socket.emit('loadCanvas', canvas.toDataURL())

  socket.on('draw', (data) => {

    ctx.strokeStyle = "rgb(" + data.red + "," + data.green + "," + data.blue + ")";
    ctx.lineWidth = data.lineSize;
    ctx.beginPath();
    ctx.moveTo(data.lastX, data.lastY);
    ctx.lineTo(data.x, data.y);
    ctx.stroke();
    socket.broadcast.emit('draw', data); // Broadcast to all other clients

  });

  socket.on('sentNameData', (data) => {

    if (clientUsernames.includes(data)) {
      
      console.log(clientUsernames);

      socket.emit('nameConfirmed', {b: false, name: data});

    } else {
      console.log(clientUsernames);
      socket.emit('nameConfirmed', {b: true, name: data});

      clientUsernames.push(data);
      userName = data;
      //currentConnectedClients.push(socket.id);

    }

  }); 

  // MY REPO IS BROKEN, UH GOTTA FIX MY NODE MODULE.


  socket.on('disconnect', (data) => {
    let deleteAt = clientUsernames.indexOf(userName);

    if (deleteAt != 0)
    {
      clientUsernames.splice(deleteAt, 1);
    }
  });
  socket.on('mouse', (data) => {

    socket.broadcast.emit('mouse', data); // Broadcast mouse movement (I MADE THIS ZELLA WATT)


  });
});

http.listen(3000, () => console.log('Server listening on port 3000'));
