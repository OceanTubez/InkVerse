const path = require('path');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(path.join(__dirname, '../client')));

// Define a route handler for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.use('/socket.io' ,express.static('client')); // Serve the client files
// console.log(app);
console.log(http);
//Going to do some stuff with server
//socket.broadcast.emit('printCur', data);
io.on('connection', (socket) => {

  console.log("connecting");  

  socket.on('draw', (data) => {
    console.log(data.lastX);
    socket.broadcast.emit('draw', data); // Broadcast to all other clients

  });

  socket.on('mouse', (data) => {

    socket.broadcast.emit('mouse', data); // Broadcast mouse movement (I MADE THIS ZELLA WATT)

  });
});

http.listen(3000, () => console.log('Server listening on port 3000'));
