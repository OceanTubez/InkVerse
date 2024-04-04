const canvasWidth = 2800;
const canvasHeight = 2400;

if (typeof document !== 'undefined') {
    document.getElementById("drawCanvas").width = canvasWidth;
    document.getElementById("drawCanvas").height = canvasHeight;
};

function drawLine(ctx, x, y, lastX, lastY) {
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    //displayContent();
}

module.exports = {drawLine, canvasWidth, canvasHeight};
