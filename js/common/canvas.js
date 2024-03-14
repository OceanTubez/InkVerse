(function(exports){

   exports.draw = function(ctx, lastX, lastY, x, y, red, green, blue, lineSize)
   {
       ctx.strokeStyle = "rgb(" + red + "," + green + "," + blue + ")";
       ctx.lineWidth = lineSize;
       ctx.beginPath();
       ctx.moveTo(lastX, lastY);
       ctx.lineTo(x, y);
       ctx.stroke();
    };

})(typeof exports === 'undefined'? this['common']={}: exports);