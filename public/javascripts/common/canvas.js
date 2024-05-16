//Canvas size. This updates for other canvas.
const canvasWidth = 10000;
const canvasHeight = 10000;

if (typeof document !== 'undefined') {
    //Loads the real canvas.
    document.getElementById("drawCanvas").width = canvasWidth;
    document.getElementById("drawCanvas").height = canvasHeight;
};

function drawLine(ctx, x, y, lastX, lastY) {
    //A common function that draws a line from x,y to another x,y
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
}

function drawPolygon(filldata, ctx, x1, x2, y1, y2) {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    filldata.lineTo(x2,y2);
}

module.exports = {drawLine, canvasWidth, canvasHeight, drawPolygon};
//NOTE: not an error.
