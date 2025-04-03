import { AttachEvent } from "../util.js";

var originalCanvasWidth = document.getElementById("body").offsetWidth;
const canvasCenter = originalCanvasWidth / 2;
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
  canvas.height = originalCanvasWidth;
  //The canvas should be the same width as the parent container it is in.
  const triangleSize = Math.min(canvas.width, canvas.height) / 2;
  clearCanvasRedraw();
  //Redraw the triangle with the new dimensions.
  const recursionLevel = parseInt(document.getElementById("recursionLevelInput").value, 10);
  drawTriangle(canvasCenter, 0, triangleSize, recursionLevel);
  //Update the original canvas width to the new width.
  originalCanvasWidth = originalCanvasWidth;
}

function clearCanvasRedraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function adjustTriangle() {
  //When the window's dimensions change:
  //Set the canvas to the new width.
  const newCanvasWidth = document.getElementById("body").offsetWidth;
  canvas.width = newCanvasWidth;
  clearCanvasRedraw();
  //Redraw the triangle with the new dimensions.
  const recursionLevel = parseInt(document.getElementById("recursionLevelInput").value, 10);
  const triangleX = canvas.width / 2;
  const triangleSize = Math.min(canvas.width, canvas.height) / 2;
  drawTriangle(triangleX, 0, triangleSize, recursionLevel);
  //Update the original canvas width to the new width.
  originalCanvasWidth = newCanvasWidth;
}

function drawTriangle(x, y, size, recursionLevel) {
  // Draw equilateral triangle using recursion
  // Height = size * Math.sqrt(3) / 2
  // Width = size
  if (recursionLevel === 0) {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - size, y + size * Math.sqrt(3));
    ctx.lineTo(x + size, y + size * Math.sqrt(3));
    ctx.closePath();
    ctx.fill();
  } else {
    const nextRecursionLevel = recursionLevel - 1;
    const halfSize = size / 2;
    const halfHeight = y + (size * Math.sqrt(3)) / 2;
    //Draw 3 smaller triangles
    drawTriangle(x, y, halfSize, nextRecursionLevel);
    drawTriangle(x - halfSize, halfHeight, halfSize, nextRecursionLevel);
    drawTriangle(x + halfSize, halfHeight, halfSize, nextRecursionLevel);
  }
}

function updateRecursionLevel(e) {
  const recursionLevel = parseInt(e.target.value, 10);

  document.getElementById("recursionLevelValue").innerHTML = recursionLevel;
  //Clear canvas and redraw
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const triangleSize = Math.min(canvas.width, canvas.height) / 2;

  drawTriangle(canvasCenter, 0, triangleSize, recursionLevel);
}