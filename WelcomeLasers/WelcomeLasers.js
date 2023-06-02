import { AttachEvents } from "../util.js";
import { CollisionType } from "./CollisionTypeEnum.js";
import { Corners } from "./Corners.js";
import { createLetters, lastLetterChase } from "./Letters.js";
import { Laser } from "./Laser.js";

var boundingBoxDebug = false;
var letters = [];
var laser = new Laser();
var originalCanvasWidth = document.getElementById("body").offsetWidth;
const canvas = document.getElementById("welcome-lasers");
const ctx = canvas.getContext("2d");
var corners;
initCanvas();

function initCanvas() {
  AttachEvents(window, "resize", adjustCanvas);
  canvas.width = originalCanvasWidth;
  canvas.height = window.innerHeight / 2;
  corners = new Corners(canvas);
  letters = createLetters(canvas, ctx);
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
  // if (letters.length == 1) {
  //   const movingLetter = lastLetterChase(letters[0], corners);
  //   letters = [movingLetter];
  // }

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
    laser.moveX();
    laser.moveY();
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
