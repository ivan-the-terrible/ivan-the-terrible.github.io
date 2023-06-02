import { TextDirection } from "./TextDirectionEnum.js";
import { DetermineFontSize } from "../util.js";
import { Letter } from "./Letter.js";

/**
 * Based on current screen size,
 * we deconstruct a word into individual letters with properties to place them.
 * @param {HTMLElement} canvas
 * @param {CanvasRenderingContext2D} ctx
 * @returns {Array} An array of letters with letter objects per index
 */
export function createLetters(canvas, ctx) {
  const fontSize = DetermineFontSize(canvas.width);
  //Need to set font size so 'measureText' has accurate sizing
  ctx.font = fontSize + "px Helvetica";
  ctx.textAlign = "center";
  ctx.fillStyle = "white";

  const random = Math.floor(Math.random() * 3);

  const messageList = ["Welcome!", "Terrible", "Pong?"];
  //const message = messageList[random];
  const message = "O";
  const letterLayoutOption = TextDirection[random];

  const letters = [];
  for (let i = 0; i < message.length; i++) {
    const character = message[i];

    const letter = new Letter(
      canvas,
      ctx,
      character,
      message.length,
      i,
      letterLayoutOption
    );

    letters[i] = letter;
  }
  return letters;
}

/**
 * The last letter will run away to avoid the laser
 * @param {Letter} letter
 * @param {Corners} corners
 */
export function lastLetterChase(letter, corners) {
  if (letter.dy == null) {
    makeLetterMove(letter, corners);
  }
  letter.moveX();
  letter.moveY();
}

/**
 *
 * @param {Letter} letter
 * @param {Corner} corners
 * @returns object with {x, y} that corresponds to the farthest corner
 */
function determineFarthestCorner(letter, corners) {
  const diffCanvasX = letter.x - corners.BottomRight.x;
  const diffCanvasY = letter.y - corners.BottomRight.y;
  //Distance of letter to origin are its own coordinates
  // letter.x - 0

  const squaredCanvasX = diffCanvasX * diffCanvasX;
  const squaredCanvasY = diffCanvasY * diffCanvasY;
  const squaredOriginX = letter.x * letter.x;
  const squaredOriginY = letter.y * letter.y;

  const bottomRightRadicand = squaredCanvasX + squaredCanvasY;
  const distanceToBottomRightCorner = Math.sqrt(bottomRightRadicand);

  const topLeftRadicand = squaredOriginX + squaredOriginY;
  const distanceToTopLeftCorner = Math.sqrt(topLeftRadicand);

  const bottomLeftRadicand = squaredOriginX + squaredCanvasY;
  const distanceToBottomLeftCorner = Math.sqrt(bottomLeftRadicand);

  const topRightRadicand = squaredCanvasX + squaredOriginY;
  const distanceToTopRight = Math.sqrt(topRightRadicand);

  const distances = [
    distanceToTopLeftCorner,
    distanceToTopRight,
    distanceToBottomRightCorner,
    distanceToBottomLeftCorner,
  ];
  const greatestDistance = Math.max(...distances);
  const farthestCorner = distances.indexOf(greatestDistance);

  switch (farthestCorner) {
    case 0:
      return corners.TopLeft;

    case 1:
      return corners.TopRight;

    case 2:
      return corners.BottomRight;

    case 3:
      return corners.BottomLeft;

    default:
      break;
  }
}

function makeLetterMove(letter, corners) {
  const farthestCorner = determineFarthestCorner(letter, corners);
  letter.dx = 5;
  letter.dy = 5;

  //dx/dy should be positive/negative based on what direction it needs to go in
  //If it's zero, then negative dx/dy to move backwards towards zero
  const xDirection = Math.sign(farthestCorner.x) ? 1 : -1;
  const yDirection = Math.sign(farthestCorner.y) ? 1 : -1;

  letter.dx = letter.dx * xDirection;
  letter.dy = letter.dy * yDirection;
}
