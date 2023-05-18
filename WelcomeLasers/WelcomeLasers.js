import { AttachEvents } from "../util.js";
import { CollisionType } from "./CollisionTypeEnum.js";
import { TextDirection } from "./TextDirectionEnum.js";

var boundingBoxDebug = false;
var letters = [];
var laser = {
  x: 0,
  y: 0,
  dx: 5,
  dy: 5,
  futureX() {
    return this.x + this.dx;
  },
  futureY() {
    return this.y + this.dy;
  },
};
var originalCanvasWidth = document.getElementById("body").offsetWidth;
const canvas = document.getElementById("welcome-lasers");
const ctx = canvas.getContext("2d");
initCanvas();

function initCanvas() {
  AttachEvents(window, "resize", adjustCanvas);
  canvas.width = originalCanvasWidth;
  canvas.height = window.innerHeight / 2;
  createLetters();
  draw();
}
function adjustCanvas() {
  //When the window's dimensions change:
  //Set the canvas to the new width.
  const newCanvasWidth = document.getElementById("body").offsetWidth;
  canvas.width = newCanvasWidth;
  //Clear canvas and redraw circles.
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //Reset the canvasWidth variable.
  originalCanvasWidth = newCanvasWidth;
  initCanvas();
}
function bounceLaser(collision) {
  switch (collision.type) {
    case "Canvas":
      moveLaserFromCanvas(collision.xSide);
      moveLaserFromCanvas(collision.ySide);
      break;

    case "Letter":
      laserHitLetter(collision);
      break;
  }
}
function createLetters() {
  const fontSize = determineFontSize();
  //Need to set font size so 'measureText' has accurate sizing
  ctx.font = fontSize + "px Helvetica";
  ctx.textAlign = "center";
  ctx.fillStyle = "white";

  const random = Math.floor(Math.random() * 3);

  const messageList = ["Welcome!", "Terrible", "Pong?"];
  const message = messageList[random];
  const letterLayoutOption = TextDirection[random];

  for (let i = 0; i < message.length; i++) {
    const character = message[i];
    const letter = placeLetter(message.length, i, letterLayoutOption);
    letter.character = character;

    const textMeasurements = ctx.measureText(character);
    letter.width = textMeasurements.width;
    letter.height = textMeasurements.actualBoundingBoxAscent;
    //Box starts in top left of character
    letter.yBox = letter.y - letter.height;
    letter.xBox = letter.x - textMeasurements.actualBoundingBoxLeft;

    letter.centerX = function centerX() {
      this.x - this.width / 2;
    };

    letter.centerY = function centerY() {
      this.y - this.height / 2;
    };

    letters[i] = letter;
  }
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
function determineLaserCollisions() {
  let collision = {};

  const letterCollision = findLetterCollision();
  if (Object.keys(letterCollision).length != 0) collision = letterCollision;

  const canvasCollision = findCanvasCollision();
  if (Object.keys(canvasCollision).length != 0) collision = canvasCollision;

  return collision;
}
function determineLetterSideCollision() {
  return CollisionType.Bottom; //TODO
}
function determineCanvasCollisionX() {
  const futureX = laser.futureX();

  switch (true) {
    case futureX > canvas.width:
      return CollisionType.Right;

    case futureX < 0:
      return CollisionType.Left;

    default:
      return "";
  }
}
function determineCanvasCollisionY() {
  const futureY = laser.futureY();

  switch (true) {
    case futureY > canvas.height:
      return CollisionType.Bottom;

    case futureY < 0:
      return CollisionType.Top;

    default:
      return "";
  }
}
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawDynamicText();
  fireLaserBeam();
  window.requestAnimationFrame(draw);
}
function drawDynamicText() {
  for (let i = 0; i < letters.length; i++) {
    const letter = letters[i];
    ctx.fillText(letter.character, letter.x, letter.y);

    if (boundingBoxDebug) {
      ctx.strokeStyle = "red";
      ctx.strokeRect(letter.xBox, letter.yBox, letter.width, letter.height);
    }
  }
  //Holy Guacamole
  //https://stackoverflow.com/questions/1451635/how-to-make-canvas-text-selectable
}
function findCanvasCollision() {
  const xSide = determineCanvasCollisionX();
  const ySide = determineCanvasCollisionY();
  if (xSide || ySide) {
    return {
      type: CollisionType.Canvas,
      xSide: xSide,
      ySide: ySide,
    };
  } else {
    return {};
  }
}
function findLetterCollision() {
  let indexToRemove;
  let isLaserTouchingBox;
  for (let i = 0; i < letters.length; i++) {
    const letter = letters[i];
    const letterXBoundary = letter.xBox + letter.width;
    const letterYBoundary = letter.yBox + letter.height;

    const isLaserTouchingBoxOnX =
      laser.x >= letter.xBox && laser.x <= letterXBoundary;

    const isLaserTouchingBoxOnY =
      laser.y >= letter.yBox && laser.y <= letterYBoundary;

    isLaserTouchingBox = isLaserTouchingBoxOnX && isLaserTouchingBoxOnY;
    if (isLaserTouchingBox) {
      indexToRemove = i;
      const letterSide = determineLetterSideCollision();
      return {
        type: CollisionType.Letter,
        side: letterSide,
        letterIndex: indexToRemove,
      };
    }
  }
  return {};
}
function fireLaserBeam() {
  ctx.beginPath();
  ctx.moveTo(laser.x, laser.y);
  ctx.lineTo(laser.futureX(), laser.futureY());
  ctx.lineWidth = 3;
  ctx.strokeStyle = "white";
  ctx.stroke();

  const collision = determineLaserCollisions();
  if (Object.keys(collision).length > 0) {
    bounceLaser(collision);
  } else {
    laser.x = laser.futureX();
    laser.y = laser.futureY();
  }
}
function moveLaserFromCanvas(side) {
  switch (side) {
    case "Right":
      laser.dx *= -1;
      laser.x = canvas.width;
      break;

    case "Left":
      laser.dx *= -1;
      laser.x = 0;
      break;

    case "Top":
      laser.dy *= -1;
      laser.y = 0;
      break;

    case "Bottom":
      laser.dy *= -1;
      laser.y = canvas.height;
      break;
  }
}
function laserHitLetter(collision) {
  //TODO update dx,dy appropriately
  laser.dx *= -1;
  laser.dy *= -1;
  switch (collision.side) {
    case "Right":
      break;

    case "Left":
      break;

    case "Top":
      break;

    case "Bottom":
      break;
  }
  letters.splice(collision.letterIndex, 1);
}
function placeLetter(length, currentIndex, letterLayoutOption) {
  const xBase = canvas.width / length;
  const yBase = canvas.height / length;

  let x;
  let y;
  //TODO: Maybe I put in a case that pops the letters up and down from the middle
  switch (letterLayoutOption) {
    case "Diagonal":
      x = xBase + xBase * currentIndex;
      y = yBase + yBase * currentIndex;
      //Keep it off the border
      if (currentIndex == 0) {
        y += 25;
      } else if (currentIndex == length - 1) {
        x -= 35;
      }
      break;

    case "ReverseDiagonal":
      x = xBase + xBase * currentIndex;
      y = yBase + yBase * (length - currentIndex);
      //Keep it off the border
      if (currentIndex == 0) {
        if (length > 6) {
          y -= 65;
        } else {
          y -= 100;
        }
      } else if (currentIndex == length - 1) {
        x -= 35;
        y -= 35;
      } else {
        y -= 55;
      }
      break;

    default:
      x = xBase + xBase * currentIndex;
      y = canvas.height / 2;
      if (currentIndex == length - 1) {
        x -= 35;
      }
      break;
  }
  return { x, y };
}
