const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
const socket = io('http://localhost:3000') // Connect to server

// Track mouse state
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Handle drawing events
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

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

  lastX = e.offset.X;
  lastY = e.offset.Y;

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
