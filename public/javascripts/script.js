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
let isPanning = false;
let lastX = 0;
let lastY = 0;

//Track pen colors and size
let red = 0;
let green = 0;
let blue = 0;
let lineSize = 1;

//Other variables

// Handle drawing events

displayCanvas.addEventListener('mousedown', function(e){
  startDrawingOrPanning(e.offsetX/scale, e.offsetY/scale, e.ctrlKey);
});
displayCanvas.addEventListener('mousemove', function(e){
  if (isDrawing)
  {
  draw(e.offsetX/scale + screenOffsetX, e.offsetY/scale + screenOffsetY);
  }
  if (isPanning)
  {
  pan(e.offsetX/scale, e.offsetY/scale);
  }
  //socket.emit('mouse', {mouseX, mouseY})
});
displayCanvas.addEventListener('mouseup', stopDrawingOrPanning);
displayCanvas.addEventListener('mouseout', stopDrawingOrPanning);
displayCanvas.addEventListener('touchstart', function(e) {
  if (e.targetTouches.length == 1)
  {
    startDrawingOrPanning(e.targetTouches[0].pageX/scale, e.targetTouches[0].pageY/scale, false)
  } else if (e.targetTouches.length == 2) {
    startDrawingOrPanning(((e.targetTouches[0].pageX + e.targetTouches[1].pageX)/2)/scale, ((e.targetTouches[0].pageY + e.targetTouches[1].pageY)/2)/scale, true)
  }
   });
displayCanvas.addEventListener('touchmove', function(e) {
  if (isDrawing)
  {
    draw(e.targetTouches[0].pageX/scale + screenOffsetX, e.targetTouches[0].pageY/scale + screenOffsetY)
  }
  if (isPanning)
  {
    pan(((e.targetTouches[0].pageX + e.targetTouches[1].pageX)/2)/scale, ((e.targetTouches[0].pageY + e.targetTouches[1].pageY)/2)/scale);
  }
});
displayCanvas.addEventListener('touchend', stopDrawingOrPanning);
displayCanvas.addEventListener('touchcancel', stopDrawingOrPanning);


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
  screenWidth = window.innerWidth;
  screenHeight = window.innerHeight;
  document.getElementById('displayCanvas').width = screenWidth;
  document.getElementById('displayCanvas').height = screenHeight;
  fixPanning();
  displayContent();
}



// Drawing functions
function startDrawingOrPanning(x, y, ctrl) {
  if (ctrl) {
    isPanning = true;
    isDrawing = false;
    lastX = x;
    lastY = y;
  }
  else {
    isDrawing = true;
    isPanning = false;
    lastX = x + screenOffsetX;
    lastY = y + screenOffsetY;
  }
}

function fixPanning() {
  if(screenOffsetX + screenWidth/scale > canvasWidth)
  {
    screenOffsetX = canvasWidth - screenWidth/scale;
  }
  if(screenOffsetY + screenHeight/scale > canvasHeight)
  {
    screenOffsetY = canvasHeight - screenHeight/scale;
  }
  if(screenOffsetX < 0)
  {
    screenOffsetX = 0;
  }
  if(screenOffsetY < 0)
  {
    screenOffsetY = 0;
  }
}
function pan(x, y) {
screenOffsetX += lastX - x;
screenOffsetY += lastY - y;
lastX = x;
lastY = y;
fixPanning();
displayContent();
}

function draw(x, y) {
  drawLine(ctx, x, y, lastX, lastY);
  displayContent();
  // Emit drawing data to the server
  socket.emit('draw', {lastX, lastY, x, y, red, green, blue, lineSize});
  lastX = x;
  lastY = y;
}

function stopDrawingOrPanning() {
  isDrawing = false;
  isPanning = false;
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
  scale *= 1.5;
  applyzoom();
}
//SUB-Heading: ZoomOutButton
function zoomOutButton() {
  playClick1();
  scale /= 1.5;
  applyzoom();
}
//SUB-Heading: Apply zoom for the buttons
function applyzoom() {
  displayContent()
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


//points

function updatePointsDisplay(points) {
    document.getElementById('points').textContent = points + " Points";
}

// Function to update the timer display
function updateTimerDisplay(hours, minutes, seconds) {
    // Format the time with leading zeros
    const formattedTime = 
        (hours < 10 ? '0' : '') + hours + ':' +
        (minutes < 10 ? '0' : '') + minutes + ':' +
        (seconds < 10 ? '0' : '') + seconds;

    // Update the HTML element with the formatted time
    document.getElementById('timer').textContent = formattedTime;
}

//Time and Poitns

function startTimerAndPoints() {
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    let points = 0;

    setInterval(function() {
        // Increment seconds
        seconds++;
        // If seconds reach 60, reset seconds and increment minutes
        if (seconds >= 60) {
            seconds = 0;
            minutes++;
            // If minutes reach 60, reset minutes and increment hours
            if (minutes >= 60) {
                minutes = 0;
                hours++;
            }
            // Add points every 60 seconds
            if (minutes % 1 === 0 && seconds === 0) {
                points += 50;
                updatePointsDisplay(points);
            }
        }
        // Update the timer display
        updateTimerDisplay(hours, minutes, seconds);
    }, 1000); // Update every second
}

// Function to update the timer display
function updateTimerDisplay(hours, minutes, seconds) {
    // Format the time with leading zeros
    const formattedTime = 
        (hours < 10 ? '0' : '') + hours + ':' +
        (minutes < 10 ? '0' : '') + minutes + ':' +
        (seconds < 10 ? '0' : '') + seconds;

    // Update the HTML element with the formatted time
    document.getElementById('timer').textContent = formattedTime;
}
 
// Start the timer and point system when the page loads
startTimerAndPoints();

//SOCKETS ONLY NOTHING ELSE
// Recieve drawing data from the server
socket.on('draw', (data) => {
  //save data
  ctx.save();
  //apply drawing data
  ctx.strokeStyle = "rgb(" + data.red + "," + data.green + "," + data.blue + ")";
  ctx.lineWidth = data.lineSize;
  drawLine(ctx, data.x, data.y, data.lastX, data.lastY);
  displayContent();
  //Reset to original
  ctx.restore();

});

socket.on('mouse', (data) => {

  console.log("empty");

})

socket.on('loadCanvas', (data) => {

  let img = new Image;
  img.onload = function(){
    ctx.drawImage(img,0,0);
    displayContent(); // Or at whatever offset you like
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
