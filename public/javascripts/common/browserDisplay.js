let scale = 1;
//scale
let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;
let screenOffsetX = 0;
let screenOffsetY = 0;

const displayCanvas = document.getElementById('displayCanvas');
const displayctx = displayCanvas.getContext('2d');


if (typeof document !== 'undefined') {
    //Loads a canvas with the browser size - This is then used to view the real canvas
    document.getElementById("displayCanvas").width = screenWidth;
    document.getElementById("displayCanvas").height = screenHeight;
}
function displayContent() {
    //Clears the content and then redraws it. Copies from the real canvas
    displayctx.clearRect(0, 0, displayCanvas.width, displayCanvas.height)
    displayctx.drawImage(canvas, screenOffsetX, screenOffsetY, screenWidth/scale, screenHeight/scale, 0, 0, screenWidth, screenHeight);
}

module.exports = {displayContent, displayctx};
//NOTE: not an error.
