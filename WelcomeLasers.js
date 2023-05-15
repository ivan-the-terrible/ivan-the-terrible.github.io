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
function determineFontSize() {
  //Following Bootstrap's criteria for response breakpoints
  const IsExtraSmall = screenSize => screenSize < 576;
  const IsSmall = screenSize => screenSize >= 576 && screenSize < 768;
  const IsMedium = screenSize => screenSize >= 768 && screenSize < 992;
  const IsLarge = screenSize => screenSize >= 992 && screenSize < 1200;
  const IsExtraLarge = screenSize => screenSize >= 1200;

  const screenSize = canvas.width;
  const baseSize = 30;
  switch (true) {
    case IsExtraSmall(screenSize):
      return baseSize;
    case IsSmall(screenSize):
      return baseSize + 15;
    case IsMedium(screenSize):
      return baseSize * 2;
    case IsLarge(screenSize):
      return baseSize * 2 + 15;
    case IsExtraLarge(screenSize):
      return baseSize * 3;
  }
}
function drawDynamicText() {
  const welcomeText = ctx.measureText("Welcome!");
  console.log(welcomeText);
  //Holy Guacamole
  //https://stackoverflow.com/questions/1451635/how-to-make-canvas-text-selectable
  ctx.strokeStyle = "red";
  let x = canvas.width / 2 - welcomeText.actualBoundingBoxLeft;
  let y = canvas.height / 2 - welcomeText.actualBoundingBoxAscent;
  let height = welcomeText.actualBoundingBoxAscent;
  ctx.strokeRect(x, y, welcomeText.width, height);

  const w = {};
  console.log({ x, y, height });
}
function welcomeLasers() {
  const fontSize = determineFontSize();
  ctx.font = fontSize + "px Helvetica";
  ctx.textAlign = "center";
  ctx.fillStyle = "white";
  ctx.fillText("Welcome!", canvas.width / 2, canvas.height / 2);

  drawDynamicText();
}
