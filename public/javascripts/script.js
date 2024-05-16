document.addEventListener("DOMContentLoaded", (event) => {
  toggleDropdown();
  initialize();
  redrawShowcase();
  loadingScreen();
  refresh();
  startTimerAndPoints();
  diceSetup();
});

const canvas = document.getElementById('drawCanvas');
const nameInput = document.getElementById('nameButton');
const ctx = canvas.getContext('2d');
let socket; // Connect to server
setSocket();

const showcase = document.getElementById('showcase');
const showcaseCTX = showcase.getContext('2d');

// Track mouse state
ctx.lineCap = "round";
let isDrawing = false;
let isPanning = false;
let lastX = 0;
let lastY = 0;
let mouseX = 0;
let mouseY = 0;

//Track pen colors and size
let red = 0;
let green = 0;
let blue = 0;
let lineSize = 1;

//Other variables

let vectorX = 0;
let vectorY = 0;
let maxDice = 0;
let stampPan, stampRefresh, stampLoad;

let brushAttributes = {
  "bigBlack": {
    size: 24,
    rgb: [0, 0, 0],
    weight: 1,
    "locked": false,
    points: 0,
  },

  "bigGreen": {
    size: 24,
    rgb: [0, 139, 0],
    weight: 2,
    "locked": true,
    points: 1,
  },

  "bigLightBlue": {
    size: 15,
    rgb: [173, 216, 230],
    weight: 3,
    "locked": true,
    points: 1,
  },

  "bigOrange": {
    size: 18,
    rgb: [255, 0, 177],
    weight: 4,
    "locked": true,
    points: 2,
  },

  "bigRed": {
    size: 27,
    rgb: [178, 34, 34],
    weight: 5,
    "locked": true,
    points: 3,
  },

  "bigBrown": {
    size: 47,
    rgb: [139, 69, 19],
    weight: 6,
    "locked": true,
    points: 4,
  },

  "bigDarkBlue": {
    size: 25,
    rgb: [0, 139, 0],
    weight: 7,
    "locked": true,
    points: 5,
  }
};

let points = 10099; //Set this to zero for release.

let panSpeedX = 0;
let panSpeedY = 0;
let loading = true;
let userName = "";
let nameDisplay = [];

// Handle drawing events

displayCanvas.addEventListener('mousedown', function (e) {
  startDrawingOrPanning(e.offsetX / scale, e.offsetY / scale, e.ctrlKey);
});
displayCanvas.addEventListener('pointermove', function (e) {
  if (userName) {
    var events = e.getCoalescedEvents();
    if (isDrawing) {
      for (const event of events) {
        draw(event.offsetX / scale + screenOffsetX, event.offsetY / scale + screenOffsetY);
      }
    }
    else if (isPanning) {
      pan(e.offsetX / scale, e.offsetY / scale);
    }
    else {
      mouseX = e.offsetX / scale + screenOffsetX;
      mouseY = e.offsetY / scale + screenOffsetY;
      socket.emit('mouseMovement', { mouseX, mouseY, userName });
    }
  }
});
displayCanvas.addEventListener('mouseup', stopDrawingOrPanning);
displayCanvas.addEventListener('mouseout', stopDrawingOrPanning);
displayCanvas.addEventListener('touchstart', function (e) {
  if (e.targetTouches.length == 1) {
    startDrawingOrPanning(e.targetTouches[0].pageX / scale, e.targetTouches[0].pageY / scale, false)
  } else if (e.targetTouches.length == 2) {
    //Takes average of two touches. Ugly but it works.
    startDrawingOrPanning(((e.targetTouches[0].pageX + e.targetTouches[1].pageX) / 2) / scale, ((e.targetTouches[0].pageY + e.targetTouches[1].pageY) / 2) / scale, true)
  }
});
displayCanvas.addEventListener('touchmove', function (e) {
  if (userName) {
    if (isDrawing) {
      draw(e.targetTouches[0].pageX / scale + screenOffsetX, e.targetTouches[0].pageY / scale + screenOffsetY)
    } else if (isPanning) {
      //Takes average of two touches. Ugly but it works.
      pan(((e.targetTouches[0].pageX + e.targetTouches[1].pageX) / 2) / scale, ((e.targetTouches[0].pageY + e.targetTouches[1].pageY) / 2) / scale);
    } else {
      mouseX = e.targetTouches[0].pageX / scale + screenOffsetX;
      mouseY = e.targetTouches[0].pageY / scale + screenOffsetY;
      socket.emit('mouseMovement', { MouseX, mouseY, userName })
    }
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
  // Initialize brush states
  initializeBrushStates();
}
// Runs each time the DOM window resize event fires.
// Resets the canvas dimensions to match window,
// then draws the new borders accordingly.
function resizeCanvas() {
  screenWidth = window.innerWidth;
  screenHeight = window.innerHeight;
  document.getElementById('displayCanvas').width = screenWidth;
  document.getElementById('displayCanvas').height = screenHeight;
}

function setSocket() {
  if (onServer == 0) {
    socket = io('localhost:3000');
  } else {
    socket = io('54.39.97.208:3000');
  }
}

function diceSetup() {
  Object.entries(brushAttributes).forEach(([key, value]) => {
    maxDice += value.weight;
  })
}

function initializeBrushStates() {
  Object.entries(brushAttributes).forEach(([key, value]) => {
    if (value.locked) {
      document.getElementById(key).className = 'button locked'
    } else {
      document.getElementById(key).className = 'button'
    }
  })
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
  //Fixes the screen panning.
  if (screenOffsetX + screenWidth / scale > canvasWidth) {
    screenOffsetX = canvasWidth - screenWidth / scale;
  }
  if (screenOffsetY + screenHeight / scale > canvasHeight) {
    screenOffsetY = canvasHeight - screenHeight / scale;
  }
  if (screenOffsetX < 0) {
    screenOffsetX = 0;
  }
  if (screenOffsetY < 0) {
    screenOffsetY = 0;
  }
}

function pan(x, y) {
  //Moves pan and loads it
  screenOffsetX += lastX - x;
  screenOffsetY += lastY - y;
  //Only useful for sliding
  panSpeedX = x - lastX;
  panSpeedY = y - lastY;

  lastX = x;
  lastY = y;

  mouseX = x + screenOffsetX;
  mouseY = y + screenOffsetY;
  socket.emit('mouseMovement', { mouseX, mouseY, userName })
}

function draw(x, y) {
  drawLine(ctx, x, y, lastX, lastY);
  // Emit drawing data to the server
  socket.emit('draw', { userName, lastX, lastY, x, y, red, green, blue, lineSize });
  lastX = x;
  lastY = y;
}

function stopDrawingOrPanning() {
  isPanning = false;
  isDrawing = false;
  panSlide()
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
  //WRITE CODE HERE TO SANITIZE

  socket.emit('sentNameData', inputValue);

  // You can store the input value in a variable or do other processing here
  // console.log("Input value:", inputValue);
}

// Buttons
function changeColor() {
  playClick1();
  //Gets random number from 0-255
  red = Math.floor(Math.random() * 256);
  green = Math.floor(Math.random() * 256);
  blue = Math.floor(Math.random() * 256);
  //Inputs random numbers
  ctx.strokeStyle = "rgb(" + red + "," + green + "," + blue + ")";
  redrawShowcase();
}

function changeSize() {
  playClick1();
  //Random linesize between 1-25
  lineSize = Math.ceil(Math.random() * 25);
  //Applies the change
  ctx.lineWidth = lineSize;
  redrawShowcase();
}

//Zoom stuff
function zoomInButton() {
  playClick1();
  scale *= 1.5;
}

function zoomOutButton() {
  playClick1();
  scale /= 1.5;
  if (screenWidth / scale > canvasWidth) {
    scale *= 1.5;
    alert("Zoom too large.");
  }
}

//Brush functions

function changeBrush(brushName) {

  let attributes = brushAttributes[brushName];

  if (attributes.locked) {
    updateBrushState(brushName)
    return;
  }
  playClick1()
  let rgb = attributes.rgb;
  ctx.strokeStyle = "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
  ctx.lineWidth = attributes.size;
  red = rgb[0];
  green = rgb[1];
  blue = rgb[2];
  lineSize = attributes.size;

  redrawShowcase();
};

function updateBrushState(brushName) {
  // Not enough points, then retrun false and don't update points/brush state
  if (points < brushAttributes[brushName].points) {
    return;
  }
  // Enough points, so update points and brush state and retun true
  points -= brushAttributes[brushName].points;
  updatePointsDisplay(points);
  brushAttributes[brushName].locked = false;
  document.getElementById(brushName).className = 'button';
}


//finds the brush associated with gacha
function gachaRoll(diceNumber) {
  let counter = 0;
  Object.entries(brushAttributes).forEach(([key, value]) => {
    counter += value.weight;
    if (counter >= diceNumber) //Only activates on one dice. 
      {
        diceBrush(key);
        counter = -9999999; //Please find a better solution lol.
      }
  })
}
//gacha system

function rollDice() {
  if (points < 300) {
    return;
  }
  
  // Subtract points
  points -= 300;
  gachaRoll(Math.ceil(Math.random() * maxDice)); //Rolls a random number between 1 and maxdice
  // const brush_name = getBrushName(diceNumber);
  updatePointsDisplay();
}

function diceBrush(brushName) {
  if (brushAttributes[brushName].locked) {
    brushAttributes[brushName].locked = false;
    document.getElementById(brushName).className = 'button'
  } else {
    // If not locked, add points
    points += 150;
  }
}

function redrawShowcase() {
  //Displays the current pen
  showcaseCTX.clearRect(0, 0, showcase.width,
    showcase.height);
  showcaseCTX.strokeStyle = "rgb(" + red + "," + green + "," + blue + ")";
  showcaseCTX.fillStyle = "rgb(" + red + "," + green + "," + blue + ")";
  showcaseCTX.beginPath();
  showcaseCTX.arc(25, 25, lineSize / 2, 0, 2 * Math.PI);
  showcaseCTX.fill();
}

function displayNames() {
  for (let i = 1; i < nameDisplay.length; i += 4) {
    if (socket.id != nameDisplay[i - 1]) {
      //Write text
      displayctx.shadowOffsetX = 2;
      displayctx.shadowOffsetY = 2;
      displayctx.shadowColor = "rgb(255,255,255)"
      displayctx.font = "16px serif"
      displayctx.fillStyle = "rgb(0,0,0)";
      displayctx.fillText(nameDisplay[i], (nameDisplay[i + 1] - screenOffsetX) * scale, (nameDisplay[i + 2] - screenOffsetY) * scale)
      //DrawMouse
      displayctx.shadowOffsetX = 0;
      displayctx.shadowOffsetY = 0;
      drawMouse((nameDisplay[i + 1] - screenOffsetX) * scale, (nameDisplay[i + 2] - screenOffsetY) * scale);
    }
  }
}

function drawMouse(x, y) {
  displayctx.beginPath();
  let fillData = new Path2D();
  fillData.moveTo(x, y);
  drawPolygon(fillData, displayctx, x, x, y, y + 13.5);
  drawPolygon(fillData, displayctx, x, x + 3, y + 13.5, y + 10);
  drawPolygon(fillData, displayctx, x + 3, x + 5.5, y + 10, y + 16);
  drawPolygon(fillData, displayctx, x + 5.5, x + 8, y + 16, y + 14);
  drawPolygon(fillData, displayctx, x + 8, x + 5, y + 14, y + 10);
  drawPolygon(fillData, displayctx, x + 5, x + 10, y + 10, y + 10);
  drawPolygon(fillData, displayctx, x + 10, x, y + 10, y);
  fillData.closePath();
  displayctx.fillStyle = "rgb(255,255,255)";
  displayctx.fill(fillData);
  displayctx.strokeStyle = "rgb(0,0,0)";
  displayctx.stroke();
}
//points

function updatePointsDisplay() {
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

  setInterval(function () {
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
        updatePointsDisplay();
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

//SOCKETS ONLY NOTHING ELSE

socket.on('mouse', (data) => {
  nameDisplay = data;
});

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

socket.on('loadCanvas', (data) => {

  let img = new Image;
  img.onload = function () {
    ctx.drawImage(img, 0, 0);
    document.getElementById("Loading").remove();
    loading = false;
  };
  img.src = data;
})

socket.on('nameConfirmed', (data) => {
  var usernameDisplay = document.getElementById("username");

  if (data.b == true) {
    usernameDisplay.textContent = data.name;
    userName = data.name;
  } else {

    document.getElementById("nameInput").value = "";
    alert("Name is already in use.");
    toggleDropdown();

  }
})

//ONLY SOCKETS HERE

//Animation Frames

function refresh(time) {
  if (!stampRefresh) {
    stampRefresh = time;
  }
  if (time - stampRefresh > 30) {
    fixPanning();
    displayContent();
    displayNames();
    stampRefresh = time;
  }
  requestAnimationFrame(refresh);
}

function loadingScreen(time) {
  if (loading == true) {
    if (!stampLoad) {
      stampLoad = time;
    }
    if (time - stampLoad > 30) {
      document.getElementById("LoadingText").textContent = document.getElementById("LoadingText").textContent + ".";
      stampLoad = time;
    }
    requestAnimationFrame(loadingScreen);
  }
}

function panSlide(time) {
  //Slides the pan based on the vector speed.
  if (panSpeedX || panSpeedY) {
    if (!stampPan) {
      stampPan = time;
    }
    let elapsedTime = time - stampPan
    if (elapsedTime > 30) {
      if (panSpeedX) {
        screenOffsetX -= panSpeedX * elapsedTime / 30 / scale;
        panSpeedX *= 0.82 * elapsedTime / 30;
        //This if statement moves the vector closer to 0.
        if (panSpeedX < 0) {
          panSpeedX += 0.01;
          if (panSpeedX > 0) {
            panSpeedX = 0;
          }
        } else {
          panSpeedX -= 0.01;
          if (panSpeedX < 0) {
            panSpeedX = 0;
          }
        }
      }
      if (panSpeedY) {
        screenOffsetY -= panSpeedY * elapsedTime / 30 / scale;
        panSpeedY *= 0.82 * elapsedTime / 30;
        //This if statement moves the vector closer to 0.
        if (panSpeedY < 0) {
          panSpeedY += 0.01;
          if (panSpeedY > 0) {
            panSpeedY = 0;
          }
        } else {
          panSpeedY -= 0.01;
          if (panSpeedY < 0) {
            panSpeedY = 0;
          }
        }
      }
      stampPan = time;
    }
    //Loads images and makes a new animation frame.
    requestAnimationFrame(panSlide);
  }
}

