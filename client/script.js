
////ON INITIALIZE
document.addEventListener("DOMContentLoaded", (event) => {
  toggleDropdown();
  initialize();
});

//INIT VARIABLES
const canvas = document.getElementById('drawCanvas');
const nameInput = document.getElementById('nameButton');
const changecolorbutton = document.getElementById('changeColor');
const ctx = canvas.getContext('2d');
const socket = io('localhost:3000'); // Connect to server
ctx.lineCap = "round";

//Track mouse 
let lastX = 0;
let lastY = 0;

//Track pen data
let isDrawing = false;
let red = 0;
let green = 0;
let blue = 0;
let lineSize = 1;

// Handle drawing events
canvas.addEventListener('mousedown', function(e){
  startDrawing(e.offsetX, e.offsetY);
});
canvas.addEventListener('mousemove', function(e){
  draw(e.offsetX, e.offsetY);
  //Below is currently not working. MOUSEX and MOUSEY do not exist btw FIX THAT
  //socket.emit('mouse', {mouseX, mouseY})
});
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);
canvas.addEventListener('touchstart', function(e) {
  if (e.targetTouches.length == 1)
  {
    var data = e.targetTouches[0];
    startDrawing(data.pageX, data.pageY)
  }
   });
canvas.addEventListener('touchmove', function(e) {
  if (e.targetTouches.length == 1)
  {
    var data = e.targetTouches[0];
    draw(data.pageX, data.pageY)
  }
});
canvas.addEventListener('touchend', stopDrawing);
canvas.addEventListener('touchcancel', stopDrawing);

// Start listening to resize events and draw canvas.
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

// Drawing functions
function startDrawing(x, y) {
  isDrawing = true;
  lastX = x;
  lastY = y;
}

function draw(x, y) {
  if (!isDrawing) return;
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();
  // Emit drawing data to the server
  socket.emit('draw', {lastX, lastY, x, y, red, green, blue, lineSize});
  lastX = x;
  lastY = y;
}

function stopDrawing() {
  isDrawing = false;
}

// Base Functions
function playClick1() {
  var clickSound = document.getElementById('clickSound');
  clickSound.play();
}

function toggleDropdown() {
  var dropdown = document.getElementById("dropdownContainer");
  dropdown.classList.toggle("active");
}
//change black brush function
document.querySelector('#ribbon .hover-image[src="https://i.ibb.co/hWK4c0f/black.png"]').addEventListener('click', function() {
    function playClick1()
    //configs
    function changeBlackBrush() {
        lineSize = 25
        lineWidth = 25
        red = 0
        blue = 0
        green = 0
        ctx.strokeStyle = "rgb(" + red + "," + green + "," + blue + ")";

    }
});
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

//SOCKETS
// Recieve drawing data from the server
socket.on('draw', (data) => {
  //save data
  let savedLineSize = lineSize;
  let savedRed = red;
  let savedBlue = blue;
  let savedGreen = green;
  //apply drawing data
  ctx.strokeStyle = "rgb(" + data.red + "," + data.green + "," + data.blue + ")";
  ctx.lineWidth = data.lineSize;
  ctx.beginPath();
  ctx.moveTo(data.lastX, data.lastY);
  ctx.lineTo(data.x, data.y);
  ctx.stroke();
  //Reset to original
  ctx.strokeStyle = "rgb(" + savedRed + "," + savedGreen + "," + savedBlue + ")";
  ctx.lineWidth = savedLineSize;
});

socket.on('mouse', (data) => {
//Make this work lol
  console.log("empty");

})
