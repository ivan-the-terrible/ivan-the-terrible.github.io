import { AttachEvent } from "../util.js";

var originalCanvasWidth = document.getElementById("body").offsetWidth;
const canvas = document.getElementById("triangleFractal");
const ctx = canvas.getContext("2d");

initCanvas(); //Initialize

function AttachEvents() {
  const recursionLevelInput = document.getElementById("recursionLevelInput");
  AttachEvent(recursionLevelInput, "input", updateRecursionLevel);

  AttachEvent(window, "resize", adjustTriangle);
}

function initCanvas() {
  AttachEvents();
  canvas.width = originalCanvasWidth;
  //The canvas should be the same width as the parent container it is in.
  const canvasCenter = originalCanvasWidth / 2;
}

function updateRecursionLevel(e) {
  const recursionLevel = parseInt(e.target.value, 10);

  document.getElementById("recursionLevelValue").innerHTML = recursionLevel;

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // drawTriangle(
  //   canvas.width / 2,
  //   canvas.height / 2,
  //   Math.min(canvas.width, canvas.height) / 2,
  //   recursionLevel
  // );
}

function adjustTriangle() {
  //When the window's dimensions change:
  //Set the canvas to the new width.
  const newCanvasWidth = document.getElementById("body").offsetWidth;
  canvas.width = newCanvasWidth;
  //The canvas should be the same width as the parent container it is in.
  const canvasOffset = newCanvasWidth - originalCanvasWidth;
  //Clear canvas and redraw
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}