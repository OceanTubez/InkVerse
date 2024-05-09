//Not certain what is coing on here
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//Creates server canvas
const draw = require('./public/javascripts/common/canvas.js')
const { createCanvas } = require('canvas');
const canvas = createCanvas(draw.canvasWidth, draw.canvasHeight);
const ctx = canvas.getContext('2d');
const server = require('./public/javascripts/common/server.js')
//NOT CURRENTLY UsING - IGNOREs
//var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');

var app = express();

//More node.js stuff - not sure
const http = require('http').createServer(app);
const io = require('socket.io')(http);
//Locate users

const userInfo = [];

//Probaly website stuff? Not sure lol
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//Routers
//app.use('/', indexRouter);
//app.use('/users', usersRouter);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/index.html'));
});

app.use('/socket.io', express.static('public'));
app.use('/socket.io', express.static('views'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// Define a route handler for the root URL 
// NOTE: Remove probably
/*
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
}); */




io.on('connection', (socket) => {
  ctx.lineCap = "round";

  console.log("connecting");
  socket.emit('loadCanvas', canvas.toDataURL())
  socket.emit('mouse', userInfo);

  socket.on('mouseMovement', (data) => {
    let index = userInfo.indexOf(socket.id);
    if (index != -1) {
    userInfo[index + 1] = data.userName;
    userInfo[index + 2] = data.mouseX;
    userInfo[index + 3] = data.mouseY;
    }

    socket.broadcast.emit('mouse', userInfo); // Broadcast mouse movement
  });

  socket.on('draw', (data) => {

    ctx.strokeStyle = "rgb(" + data.red + "," + data.green + "," + data.blue + ")";
    ctx.lineWidth = data.lineSize;
    draw.drawLine(ctx, data.x, data.y, data.lastX, data.lastY);
    socket.broadcast.emit('draw', data); // Broadcast to all other clients

    let index = userInfo.indexOf(socket.id);
    if (index != -1) {
    userInfo[index + 1] = data.userName;
    userInfo[index + 2] = data.x;
    userInfo[index + 3] = data.y;
    }
    socket.broadcast.emit('mouse', userInfo);

  });

  socket.on('sentNameData', (data) => {

    if (userInfo.includes(data)) {

      socket.emit('nameConfirmed', { b: false, name: data });

    } else {
      socket.emit('nameConfirmed', { b: true, name: data });

      userInfo.push(socket.id);
      userInfo.push(data);
      userInfo.push(draw.canvasWidth + 100);
      userInfo.push(draw.canvasHeight + 100);

    }

  });


  // MY REPO IS BROKEN, UH GOTTA FIX MY NODE MODULE.


  socket.on('disconnect', (notUsed) => {
    let deleteAt = userInfo.indexOf(socket.id)
    if (deleteAt != -1) {
      userInfo.splice(deleteAt, 4);
    }
    socket.broadcast.emit('mouse', userInfo);
  });
});
//CHANGE THIS FOR FULL RELEASE!!!!!!

if (server.onServer == 0)
  {
    http.listen(3000, '127.0.0.1', () => console.log('Server listening on port 3000'));
  } else {
    http.listen(3000, '54.39.97.208', () => console.log('Server listening on port 3000'));
  } 



module.exports = app;
