function initCanvas() {
  canvas.width = originalCanvasWidth;
  canvas.height = window.innerHeight / 2;
  welcomeLasers();
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
  welcomeLasers();
}
function AttachEvents(element, type, handler) {
  element.addEventListener(type, handler);
}
function drawDynamicText() {
  const welcomeText = ctx.measureText("Welcome!");
  console.log(welcomeText);
  //Holy Guacamole
  //https://stackoverflow.com/questions/1451635/how-to-make-canvas-text-selectable
  ctx.strokeStyle = "red";
  let x = canvasWidth - welcomeText.actualBoundingBoxLeft;
  let y = canvasHeight - welcomeText.actualBoundingBoxAscent;
  let height = welcomeText.actualBoundingBoxAscent;
  ctx.strokeRect(x, y, welcomeText.width, height);
}

function welcomeLasers() {
  const canvasWidth = canvas.width / 2;
  const canvasHeight = canvas.height / 2;

  ctx.font = "30px Helvetica";
  ctx.textAlign = "center";
  ctx.fillStyle = "white";
  ctx.fillText("Welcome!", canvasWidth, canvasHeight);
}
