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
  const fontSize = DetermineFontSize(canvas);
  //Need to set font size so 'measureText' has accurate sizing
  ctx.font = fontSize + "px Helvetica";
  ctx.textAlign = "center";
  ctx.fillStyle = "white";

  const random = Math.floor(Math.random() * 3);

  const messageList = ["Welcome!", "Terrible", "Pong?"];
  const message = messageList[random];
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
