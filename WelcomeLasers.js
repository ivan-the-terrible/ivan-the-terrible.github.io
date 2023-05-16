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
function placeLetter(length, currentIndex, letterLayout) {
  const xBase = canvas.width / length;
  const yBase = canvas.height / length;

  let x;
  let y;
  //TODO: Maybe I put in a case that pops the letters up and down from the middle
  switch (letterLayout) {
    case 0: //This is orients the letters diagonally
      x = xBase + xBase * currentIndex;
      y = yBase + yBase * currentIndex;
      //Keep it off the border
      if (length > 7) {
        if (currentIndex == 0) {
          y += 25;
        } else if (currentIndex == length - 1) {
          x -= 35;
        }
      }
      break;
    case 1: //This orients the letters from bottom left to top right (reverse diagonal)
      x = xBase + xBase * currentIndex;
      y = yBase + yBase * (length - currentIndex);
      //Keep it off the border
      if (length > 7) {
        if (currentIndex == 0) {
          y -= 55;
        } else if (currentIndex == length - 1) {
          x -= 35;
          y -= 35;
        } else {
          y -= 55;
        }
      }
      break;
    default: //This orients the letters normally, from left to right
      x = xBase + xBase * currentIndex;
      y = canvas.height / 2;
      if (length > 7) {
        if (currentIndex == length - 1) {
          x -= 35;
        }
      }
      break;
  }
  return { x, y };
}
function drawDynamicText() {
  const message = "Welcome!";
  const letterLayout = Math.floor(Math.random() * 3);
  for (let i = 0; i < message.length; i++) {
    const character = message[i];
    const letter = placeLetter(message.length, i, letterLayout);

    const textMeasurements = ctx.measureText(character);
    letter.width = textMeasurements.width;
    letter.height = textMeasurements.actualBoundingBoxAscent;

    //Box starts in top left of character
    letter.yBox = letter.y - letter.height;
    letter.xBox = letter.x - textMeasurements.actualBoundingBoxLeft;

    ctx.fillText(character, letter.x, letter.y);

    if (boundingBoxDebug) {
      ctx.strokeStyle = "red";
      ctx.strokeRect(letter.xBox, letter.yBox, letter.width, letter.height);
    }
    letters[i] = letter;
  }
  //Holy Guacamole
  //https://stackoverflow.com/questions/1451635/how-to-make-canvas-text-selectable
  console.log(letters);
}
function welcomeLasers() {
  const fontSize = determineFontSize();
  ctx.font = fontSize + "px Helvetica";
  ctx.textAlign = "center";
  ctx.fillStyle = "white";
  drawDynamicText();
}
