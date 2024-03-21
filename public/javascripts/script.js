

document.addEventListener("DOMContentLoaded", (event) => {
  toggleDropdown();
  initialize();
  redrawShowcase();
});

const canvas = document.getElementById('drawCanvas');
const nameInput = document.getElementById('nameButton');
const ctx = canvas.getContext('2d');
const socket = io('localhost:3000'); // Connect to server

const showcase = document.getElementById('showcase');
const showcaseCTX = showcase.getContext('2d');

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

//Other variables
let scale = 1.0;

// Handle drawing events

canvas.addEventListener('mousedown', function(e){
  startDrawing(e.offsetX, e.offsetY);
});
canvas.addEventListener('mousemove', function(e){
  draw(e.offsetX, e.offsetY);
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
  drawLine(ctx, x, y, lastX, lastY);
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

  saveName();

}

function saveName() {

  var inputValue = document.getElementById("nameInput").value;

  if (inputValue == "") {

    return;

  }

  socket.emit('sentNameData', inputValue);

  // You can store the input value in a variable or do other processing here
  // console.log("Input value:", inputValue);

}

// Buttons
function changeColor() {
  playClick1();
  //Gets random number from 0-255
  red = Math.floor(Math.random()*256);
  green = Math.floor(Math.random()*256);
  blue = Math.floor(Math.random()*256);
  //Inputs random numbers
  ctx.strokeStyle = "rgb(" + red + "," + green + "," + blue + ")";
  redrawShowcase();
}

function changeSize() {
  playClick1();
  //Random linesize between 1-25
  lineSize = Math.ceil(Math.random()*25);
  //Applies the change
  ctx.lineWidth = lineSize;
  redrawShowcase();
          
}


function zoomInButton() {
  playClick1();
  scale *= 2.25;
  applyzoom();
}
//SUB-Heading: ZoomOutButton
function zoomOutButton() {
  playClick1();
  scale /= 2.25;
  applyzoom();
}
//SUB-Heading: Apply zoom for the buttons
function applyzoom() {
  //ctx.save();
  canvas.scale(scale, scale);
  //ctx.clearRect(0, 0, canvas.width, canvas.height);
  //ctx.restore();
}

//Brush functions
function changeBrush(size, r, b, g) {
    playClick1()
    red = r;
    blue = b;
    green = g;
    lineSize = size;
    ctx.strokeStyle = "rgb(" + r + "," + g + "," + b + ")";
    ctx.lineWidth = size;
    redrawShowcase();
};

function redrawShowcase() {
  showcaseCTX.clearRect(0, 0, showcase.width, showcase.height);
  showcaseCTX.strokeStyle = "rgb(" + red + "," + green + "," + blue + ")"; 
  showcaseCTX.fillStyle = "rgb(" + red + "," + green + "," + blue + ")";
  showcaseCTX.beginPath();
  showcaseCTX.arc(25, 25, lineSize/2, 0, 2 * Math.PI);
  showcaseCTX.fill();
}

//SOCKETS ONLY NOTHING ELSE
// Recieve drawing data from the server
socket.on('draw', (data) => {
  //save data
  ctx.save();
  //apply drawing data
  ctx.strokeStyle = "rgb(" + data.red + "," + data.green + "," + data.blue + ")";
  ctx.lineWidth = data.lineSize;
  drawLine(ctx, data.x, data.y, data.lastX, data.lastY);
  //Reset to original
  ctx.restore();

});

socket.on('mouse', (data) => {

  console.log("empty");

})

socket.on('loadCanvas', (data) => {

  let img = new Image;
  img.onload = function(){
    ctx.drawImage(img,0,0); // Or at whatever offset you like
  };
  img.src = data;

})

socket.on('nameConfirmed', (data) => {
  var usernameDisplay = document.getElementById("username");

  if (data.b == true)
  {
    usernameDisplay.textContent = data.name;
  } else {

    document.getElementById("nameInput").value = "";
    alert("Name is already in use.");
    toggleDropdown();
    
  }
})

//ONLY SOCKETS HERE
