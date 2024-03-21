 function drawLine(ctx, x, y, lastX, lastY) {
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
}

module.exports = {drawLine};