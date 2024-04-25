//Not certain what is coing on here
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//Creates server canvas
const draw = require('./public/javascripts/common/canvas.js')
const {createCanvas} = require('canvas');
const canvas = createCanvas(draw.canvasWidth, draw.canvasHeight);
const ctx = canvas.getContext('2d');
//NOT CURRENTLY UsING - IGNOREs
//var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');

var app = express();

//More node.js stuff - not sure
const http = require('http').createServer(app);
const io = require('socket.io')(http);
//Locate users

const connectedClientIDs = [];
const clientUsernames = [];
const nameLocations = [];


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
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
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

  socket.on('mouseMovement', (data) => {
    data.id = socket.id;

    let index = nameLocations.indexOf(data.id);
    //Locates userid
    if (index == -1)
    {
      nameLocations.push(data.id);
      nameLocations.push(data.userName);
      nameLocations.push(data.mouseX);
      nameLocations.push(data.mouseY);
    } else {
      nameLocations[index+1] = data.userName;
      nameLocations[index+2] = data.mouseX;
      nameLocations[index+3] = data.mouseY;
    }
    socket.broadcast.emit('mouse', nameLocations); // Broadcast mouse movement

  });

  socket.on('draw', (data) => {

    ctx.strokeStyle = "rgb(" + data.red + "," + data.green + "," + data.blue + ")";
    ctx.lineWidth = data.lineSize;
    draw.drawLine(ctx, data.x, data.y, data.lastX, data.lastY);
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
    deleteAt = nameLocations.indexOf(socket.id);
    if (deleteAt != -1)
    {
      nameLocations.splice(deleteAt, 4);
    }
  });
});
//CHANGE THIS FOR FULL RELEASE!!!!!!
http.listen(3000, '127.0.0.1', () => console.log('Server listening on port 3000'));


module.exports = app;
