let scale = 1;

let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;
let screenOffsetX = 0;
let screenOffsetY = 0;
const displayCanvas = document.getElementById('displayCanvas');
const displayctx = displayCanvas.getContext('2d');


if (typeof document !== 'undefined') {
    document.getElementById("displayCanvas").width = screenWidth;
    document.getElementById("displayCanvas").height = screenHeight;
};

function displayContent() {
    displayctx.clearRect(0, 0, displayCanvas.width, displayCanvas.height)
    displayctx.drawImage(canvas, screenOffsetX, screenOffsetY, screenWidth/scale, screenHeight/scale, 0, 0, screenWidth, screenHeight);
}

module.exports = {displayContent};
  console.log("NOTE: This is not an error, not certain why it shows as one.")
