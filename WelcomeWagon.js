function initCanvas() {
  canvas.width = originalCanvasWidth;
  canvas.height = window.innerHeight / 2;
  welcomeWagon();
}
function adjust() {
  //When the window's dimensions change:
  //Set the canvas to the new width.
  const newCanvasWidth = document.getElementById("body").offsetWidth;
  canvas.width = newCanvasWidth;
  //Clear canvas and redraw circles.
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //Reset the canvasWidth variable.
  originalCanvasWidth = newCanvasWidth;
}
function AttachEvents(element, type, handler) {
  element.addEventListener(type, handler);
}

function welcomeWagon() {
  ctx.font = "30px Helvetica";
  ctx.textAlign = "center";
  ctx.fillStyle = "white";
  ctx.fillText("Welcome!", canvas.width / 2, canvas.height / 2);
}
