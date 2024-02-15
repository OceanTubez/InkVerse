const canvas = document.getElementById('drawCanvas');
const changecolorbutton = document.getElementById('changeColor');
const ctx = canvas.getContext('2d');
const socket = io('localhost:3000'); // Connect to server

// Track mouse state
ctx.lineCap = "round";
let isDrawing = false;
let lastX = 0;
let lastY = 0;

//Track pen colors and size
let red = 0;
let green = 0;
let blue = 0;
let lineSize = 1;
// Handle drawing events

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);
canvas.addEventListener('touchstart', startTouchDrawing);
canvas.addEventListener('touchmove', touchDraw);
canvas.addEventListener('touchend', stopDrawing);
canvas.addEventListener('touchcancel', stopDrawing);

(function() {

  // Start listening to resize events and draw canvas.
  initialize();
  function initialize() {
    // Register an event listener to call the resizeCanvas() function 
    // each time the window is resized.
    window.addEventListener('resize', resizeCanvas, false);
    // Draw canvas border for the first time.
    resizeCanvas();
  }
  // Runs each time the DOM window resize event fires.
  // Resets the canvas dimensions to match window,
  // then draws the new borders accordingly.
  function resizeCanvas() {
    ctx.width = window.innerWidth;
    ctx.height = window.innerHeight;
  }
})();


// Drawing functions
function startDrawing(e) {
  isDrawing = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
}

function draw(e) {
  if (!isDrawing) return;
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  // Emit drawing data to the server
  socket.emit('draw', { lastX, lastY, x: e.offsetX, y: e.offsetY, red, green, blue, lineSize});
  lastX = e.offsetX;
  lastY = e.offsetY;
}

function stopDrawing() {
  isDrawing = false;
}

//Handle touch
function startTouchDrawing(e) {
  if (e.targetTouches.length == 1)
  {
    var data = e.targetTouches[0];
    isDrawing = true;
    lastX = data.offsetX;
    lastY = data.offsetY;
  }
}

function touchDraw(e) {
  if (!isDrawing) return;
  if (e.targetTouches.length == 1)
  {
    var data = e.targetTouches[0];
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(data.offsetX, data.offsetY);
    ctx.stroke();
    // Emit drawing data to the server
    socket.emit('draw', { lastX, lastY, x: data.offsetX, y: data.offsetY, red, green, blue, lineSize});
    lastX = data.offsetX;
    lastY = data.offsetY;
  }
}

// Base Functions
function playClick1() {
  var clickSound = document.getElementById('clickSound');
  clickSound.play();
}


// Buttons
function changeColor() {
  playClick1()
  //Gets random number from 0-255
  red = Math.floor(Math.random()*256);
  green = Math.floor(Math.random()*256);
  blue = Math.floor(Math.random()*256);
  //Inputs random numbers
  ctx.strokeStyle = "rgb(" + red + "," + green + "," + blue + ")";
}

function changeSize() {
  playClick1()
  //Random linesize between 1-25
  lineSize = Math.floor(Math.random()*24+1);
  //Applies the change
  ctx.lineWidth = lineSize;
          
}
          
// Recieve drawing data from the server
socket.on('draw', (data) => {
  let savedLineSize = lineSize;
  let savedRed = red;
  let savedBlue = blue;
  let savedGreen = green;
  ctx.strokeStyle = "rgb(" + data.red + "," + data.green + "," + data.blue + ")";
  ctx.lineWidth = data.lineSize;
  ctx.beginPath();
  ctx.moveTo(data.lastX, data.lastY);
  ctx.lineTo(data.x, data.y);
  ctx.stroke();
  ctx.strokeStyle = "rgb(" + savedRed + "," + savedGreen + "," + savedBlue + ")";
  ctx.lineWidth = savedLineSize;
});