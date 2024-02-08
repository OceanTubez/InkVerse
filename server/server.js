const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('client')); // Serve the client files
// console.log(app);
console.log(http);
io.on('connection', (socket) => {

  console.log("connecting");

  socket.on('draw', (data) => {

    socket.broadcast.emit('draw', data); // Broadcast to all other clients

  });
});

http.listen(3000, () => console.log('Server listening on port 3000'));
