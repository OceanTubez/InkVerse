const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');

ctx.fillStyle = "#FF0000";
ctx.fillRect(0, 0, 150, 75);
const socket = io('http://localhost:3000'); // Connect to server

// Track mouse state
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Handle drawing events
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

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
  lastY= e.offsetY;

}

function draw(e) {

  if (!isDrawing) return;
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();

  // Emit drawing data to the server

  socket.emit('draw', { lastX, lastY, x: e.offsetX, y: e.offsetY });

  lastX = e.offsetX;
  lastY = e.offsetY;

}

function stopDrawing() {
  isDrawing = false;
}

// Recieve drawing data from the server
socket.on('draw', (data) => {

  ctx.beginPath();
  ctx.moveTo(data.lastX, data.lastY);
  ctx.lineTo(data.x, data.y);
  ctx.stroke();

});
