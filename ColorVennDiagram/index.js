import { AttachEvent } from "../util.js";

var mouseDebug = false;
var circleBoundaryDebug = false;
var lensDebug = false;
var reuleauxDebug = false;
var rgbResult;
var currentCircle = null;
var originalX;
var originalY;
var shapes;
var circleRadius = 75;
var originalCanvasWidth = document.getElementById("body").offsetWidth;
const canvas = document.getElementById("colorVennDiagram");
const ctx = canvas.getContext("2d");

initCanvas(); //Initialize
var lastCircle = shapes.circle1;

//#region Debug
function ToggleMouseDebug() {
  mouseDebug = !mouseDebug;
  if (mouseDebug) {
    this.style.backgroundColor = "lightgreen";
  } else {
    this.style.backgroundColor = "";
  }
}
function ToggleCircleBoundaryDebug() {
  circleBoundaryDebug = !circleBoundaryDebug;
  if (circleBoundaryDebug) {
    this.style.backgroundColor = "lightgreen";
  } else {
    this.style.backgroundColor = "";
  }
}
function ToggleLensCenterAndIntersectionsDebug() {
  lensDebug = !lensDebug;
  if (lensDebug) {
    this.style.backgroundColor = "lightgreen";
  } else {
    this.style.backgroundColor = "";
  }
}
function ToggleReuleauxPointsDebug() {
  reuleauxDebug = !reuleauxDebug;
  if (reuleauxDebug) {
    this.style.backgroundColor = "lightgreen";
  } else {
    this.style.backgroundColor = "";
  }
}
function mouseToCircleBoundariesDebug(
  mouseX,
  mouseY,
  circles,
  numberOfCircles
) {
  //Draw circle of mouse position.
  ctx.beginPath();
  ctx.arc(mouseX, mouseY, circleRadius / 5, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fillStyle = "pink";
  ctx.fill();
  ctx.strokeStyle = "black";
  ctx.stroke();
  //Add each circle name as a key to mouseToCircleBoundaries object
  const mouseToCircleBoundaries = {};
  for (let i = 0; i < numberOfCircles; i++) {
    mouseToCircleBoundaries[circles[i]] = {};
  }
  for (const key in mouseToCircleBoundaries) {
    mouseToCircleBoundaries[key] = getMouseToCircleBoundaries(shapes[key]);
  }
  //Draw line from center and circle at boundary
  ctx.fillStyle = "black";
  for (const key in shapes) {
    const circle = shapes[key];
    const circleBoundaries = mouseToCircleBoundaries[key];
    ctx.beginPath();
    ctx.moveTo(circle.x, circle.y);
    ctx.lineTo(circleBoundaries.boundaryX, circleBoundaries.boundaryY);
    ctx.stroke();
    //Calling my drawCircle() function is slower compared to this. Trust me, I measured. Function calls also cost a little more time.
    ctx.beginPath();
    ctx.arc(
      circleBoundaries.boundaryX,
      circleBoundaries.boundaryY,
      circleRadius / 5,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }
}
function circleToCircleBoundariesDebug(circles, numberOfCircles) {
  const circleToCircleBoundariesDEBUG = {};
  //Add each circle name as a key to circleToCircleBoundariesDEBUG object.
  for (let i = 0; i < numberOfCircles; i++)
    circleToCircleBoundariesDEBUG[circles[i]] = {};
  //Loop through and draw the boundaries
  for (let i = 0; i < numberOfCircles; i++) {
    const baseCircle = circles[i];
    for (let j = 1; (i + j) % numberOfCircles != i; j++) {
      const toCircle = circles[(i + j) % numberOfCircles]; //Carousel around the array to hit each circle.
      circleToCircleBoundariesDEBUG[baseCircle][toCircle] =
        getCircleToCircleBoundaries(shapes[toCircle], shapes[baseCircle]);
      //Visually display the boundaries
      const circle = shapes[baseCircle];
      const boundaries = circleToCircleBoundariesDEBUG[baseCircle][toCircle];
      ctx.beginPath();
      //Draw line from center to boundary.
      ctx.moveTo(circle.x, circle.y);
      ctx.lineTo(boundaries.boundaryX, boundaries.boundaryY);
      ctx.strokeStyle = "black";
      ctx.stroke();
      //Draw associated circle at boundary.
      ctx.beginPath();
      ctx.arc(
        boundaries.boundaryX,
        boundaries.boundaryY,
        circleRadius / 5,
        0,
        2 * Math.PI
      );
      const color = shapes[toCircle].color;
      ctx.fillStyle =
        "rgb(" + color[0] + ", " + color[1] + ", " + color[2] + ")";
      ctx.fill();
      ctx.stroke();
    }
  }
}
function lensCenterAndIntersectionsDebug(lenses) {
  for (let lensName in lenses) {
    const lens = lenses[lensName];
    //Lens Center
    drawCircle(lens.centerX, lens.centerY, 5, [0, 0, 0]);
    ctx.beginPath();
    ctx.font = "10px";
    ctx.fillStyle = "white";
    ctx.fillText("L" + lens.id, lens.centerX, lens.centerY);
    drawCircle(
      lens.intersection.upper.x,
      lens.intersection.upper.y,
      5,
      [0, 0, 255]
    );
    drawCircle(
      lens.intersection.lower.x,
      lens.intersection.lower.y,
      5,
      [255, 0, 0]
    );
    //Loop through each intersection and draw a dotted line from the circles' center to the intersection. Display the angle.
    //Make the dotted line color match the lensCenterAndIntersectionsDebug intersection colors.
    ctx.setLineDash([5, 15]);
    for (let intersectionName in lens.intersection) {
      const intersection = lens.intersection[intersectionName];
      //Base Circle
      ctx.beginPath();
      ctx.moveTo(lens.baseCircle.x, lens.baseCircle.y);
      ctx.lineTo(intersection.x, intersection.y);
      //If the intersection circle color is the same color as the circle, make the strokeStyle black.
      let circleColorHex = rgbToHex(...lens.baseCircle.color);
      if (intersectionName == "upper") {
        ctx.strokeStyle = circleColorHex == "#0000ff" ? "black" : "blue";
      } else {
        ctx.strokeStyle = circleColorHex == "#ff0000" ? "black" : "red";
      }
      ctx.stroke();
      //To Circle
      ctx.beginPath();
      ctx.moveTo(lens.toCircle.x, lens.toCircle.y);
      ctx.lineTo(intersection.x, intersection.y);
      //If the intersection circle color is the same color as the circle, make the strokeStyle black.
      circleColorHex = rgbToHex(...lens.toCircle.color);
      if (intersectionName == "upper") {
        ctx.strokeStyle = circleColorHex == "#0000ff" ? "black" : "blue";
      } else {
        ctx.strokeStyle = circleColorHex == "#ff0000" ? "black" : "red";
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }
}
function reuleauxPointsDebug(reuleauxTriangles) {
  for (let reuleauxTriangleName in reuleauxTriangles) {
    const reuleauxTriangle = reuleauxTriangles[reuleauxTriangleName];
    ctx.beginPath();
    ctx.font = "10px";
    ctx.fillStyle = "black";
    for (let pointName in reuleauxTriangle) {
      const point = reuleauxTriangle[pointName];
      ctx.fillText(
        "R" + point.id,
        point.intersectionCoordinates.x,
        point.intersectionCoordinates.y
      );
    }
  }
}
function componentToHex(c) {
  let hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
//#endregion

function AttachEvents() {
  AttachEvent(canvas, "mousedown", setActive);
  AttachEvent(canvas, "mousemove", moveCircle);
  AttachEvent(canvas, "mouseup", removeActive);
  AttachEvent(window, "resize", adjustShapes);

  //#region Inputs
  const redInput = document.getElementById("redInput");
  AttachEvent(redInput, "input", changeRed);

  const greenInput = document.getElementById("greenInput");
  AttachEvent(greenInput, "input", changeGreen);

  const blueInput = document.getElementById("blueInput");
  AttachEvent(blueInput, "input", changeBlue);
  //#endregion
  //#region Buttons
  const btnMouseDebug = document.getElementById("btnMouseDebug");
  AttachEvent(btnMouseDebug, "click", ToggleMouseDebug);

  const btnCircleDebug = document.getElementById("btnCircleDebug");
  AttachEvent(btnCircleDebug, "click", ToggleCircleBoundaryDebug);

  const btnLensDebug = document.getElementById("btnLensDebug");
  AttachEvent(btnLensDebug, "click", ToggleLensCenterAndIntersectionsDebug);

  const btnReuleauxDebug = document.getElementById("btnReuleauxDebug");
  AttachEvent(btnReuleauxDebug, "click", ToggleReuleauxPointsDebug);

  const btnAddCircle = document.getElementById("btnAddCircle");
  AttachEvent(btnAddCircle, "click", AddCircle);

  const btnReset = document.getElementById("btnReset");
  AttachEvent(btnReset, "click", initCanvas);
  //#endregion
}

function initCanvas() {
  AttachEvents();
  canvas.width = originalCanvasWidth;
  //The canvas should be the same width as the parent container it is in.
  const canvasCenter = originalCanvasWidth / 2;
  shapes = {
    circle1: {
      id: 1,
      x: canvasCenter,
      y: 99,
      radius: circleRadius,
      redValue: 255,
      greenValue: 0,
      blueValue: 0,
      get color() {
        return [this.redValue, this.greenValue, this.blueValue];
      },
    },
    circle2: {
      id: 2,
      x: canvasCenter + 100, //canvasCenter,
      y: 99, //250,
      radius: circleRadius,
      redValue: 0,
      greenValue: 255,
      blueValue: 0,
      get color() {
        return [this.redValue, this.greenValue, this.blueValue];
      },
    },
    circle3: {
      id: 3,
      x: canvasCenter + 50, //canvasCenter,
      y: 200, //401,
      radius: circleRadius,
      redValue: 0,
      greenValue: 0,
      blueValue: 255,
      get color() {
        return [this.redValue, this.greenValue, this.blueValue];
      },
    },
  };
  drawCircles();
}
function adjustShapes() {
  //When the window's dimensions change:
  //Set the canvas to the new width.
  const newCanvasWidth = document.getElementById("body").offsetWidth;
  canvas.width = newCanvasWidth;
  //The canvas should be the same width as the parent container it is in.
  const canvasOffset = newCanvasWidth - originalCanvasWidth;
  //Clear canvas and redraw circles.
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const key in shapes) {
    const circle = shapes[key];
    //I don't want the circles to go off screen when resizing.
    if (circle.x + canvasOffset > circle.radius) {
      circle.x = circle.x + canvasOffset;
    } else {
      circle.x = circle.radius;
    }
    drawCircle(circle.x, circle.y, circle.radius, circle.color);
  }
  //Reset the canvasWidth variable.
  originalCanvasWidth = newCanvasWidth;
}
function AddCircle() {
  const nextCircleNumber = Object.keys(shapes).length + 1;
  shapes["circle" + nextCircleNumber] = {
    id: nextCircleNumber,
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: circleRadius,
    redValue: Math.floor(Math.random() * 256),
    greenValue: Math.floor(Math.random() * 256),
    blueValue: Math.floor(Math.random() * 256),
    get color() {
      return [this.redValue, this.greenValue, this.blueValue];
    },
  };
  drawCircles();
}
//#region These functions have been adapted from W3Schools Color Picker page: https://www.w3schools.com/colors/colors_picker.asp
function changeRed() {
  document.querySelector(".redValue").innerHTML = this.value;
  updateColor();
}
function changeGreen() {
  document.querySelector(".greenValue").innerHTML = this.value;
  updateColor();
}
function changeBlue() {
  document.querySelector(".blueValue").innerHTML = this.value;
  updateColor();
}
function updateColor() {
  //Get the RGB values
  const redValue = parseInt(document.querySelector(".redValue").innerHTML);
  const greenValue = parseInt(document.querySelector(".greenValue").innerHTML);
  const blueValue = parseInt(document.querySelector(".blueValue").innerHTML);
  //Set the preview color area
  rgbResult = "rgb(" + redValue + ", " + greenValue + ", " + blueValue + ")";
  document.getElementById("rgbResult").style.backgroundColor = rgbResult;
  //Update the lastCircle color
  if (lastCircle != null) {
    lastCircle.redValue = redValue;
    lastCircle.greenValue = greenValue;
    lastCircle.blueValue = blueValue;
    drawCircles();
  }
}
//#endregion
function setInputs(redValue, greenValue, blueValue) {
  //Update the paragraphs displaying integer RGB value
  document.querySelector(".redValue").innerHTML = redValue;
  document.querySelector(".greenValue").innerHTML = greenValue;
  document.querySelector(".blueValue").innerHTML = blueValue;
  //Update sliders
  document.getElementById("redInput").value = redValue;
  document.getElementById("greenInput").value = greenValue;
  document.getElementById("blueInput").value = blueValue;
  //Update preview color area
  document.getElementById("rgbResult").style.backgroundColor =
    "rgb(" + redValue + ", " + greenValue + ", " + blueValue + ")";
}
function check255(value) {
  //Make sure value is within RGB color space.
  if (value > 255) return 255;
  return value;
}
function colorAddition(red1, green1, blue1, red2, green2, blue2) {
  //With the arrays containing R, G, and B values spread within the parameters,
  //return an array of additive values within the RGB color space.
  return [
    check255(red1 + red2),
    check255(green1 + green2),
    check255(blue1 + blue2),
  ];
}
//#region Draw
function drawCircles() {
  for (const key in shapes) {
    const circle = shapes[key];
    drawCircle(circle.x, circle.y, circle.radius, circle.color);
  }
}
function drawCircle(centerX, centerY, radius, color = [255, 255, 255]) {
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  //Default fill is white
  ctx.fillStyle = "rgb(" + color[0] + ", " + color[1] + ", " + color[2] + ")";
  ctx.fill();
}
function drawLens(lens, rgbAdditiveString) {
  /*
      We got mostly everything we needed from Paul Bourke's proof.
      In order to draw the lens, we will need to cut the lens in half and draw each half of the lens.
      Note: REMEMBER YOUR TRIG!!! The intersections help set our starting and ending angles below.
  */
  //Determine the start and end angles of our intersections in relation to each circle center.
  //Base Circle lens half (it's inside To Circle)
  const upperAngleBaseCircle = Math.atan2(
    lens.intersection.upper.y - lens.baseCircle.y,
    lens.intersection.upper.x - lens.baseCircle.x
  );
  const lowerAngleBaseCircle = Math.atan2(
    lens.intersection.lower.y - lens.baseCircle.y,
    lens.intersection.lower.x - lens.baseCircle.x
  );
  ctx.beginPath();
  ctx.fillStyle = rgbAdditiveString;
  //Note that the startAngle and endAngle are in reversed here ;)
  //You could put them in the other order and set the CounterClockwise parameter to true.
  //But this keeps the geometry of the screen in mind.
  ctx.arc(
    lens.baseCircle.x,
    lens.baseCircle.y,
    lens.baseCircle.radius,
    upperAngleBaseCircle,
    lowerAngleBaseCircle
  );
  ctx.fill();
  //To Circle lens half (it's inside Base Circle)
  const upperAngleToCircle = Math.atan2(
    lens.intersection.upper.y - lens.toCircle.y,
    lens.intersection.upper.x - lens.toCircle.x
  );
  const lowerAngleToCircle = Math.atan2(
    lens.intersection.lower.y - lens.toCircle.y,
    lens.intersection.lower.x - lens.toCircle.x
  );
  ctx.beginPath();
  ctx.arc(
    lens.toCircle.x,
    lens.toCircle.y,
    lens.toCircle.radius,
    lowerAngleToCircle,
    upperAngleToCircle
  );
  ctx.fill();
  //Draw line to cover gap
  //Without this line, there is a weird (about 1px) gap. I'm sure there is a mathematical reason behind it ;)
  ctx.moveTo(lens.intersection.lower.x, lens.intersection.lower.y);
  ctx.lineTo(lens.intersection.upper.x, lens.intersection.upper.y);
  ctx.strokeStyle = rgbAdditiveString;
  ctx.stroke();
}
function drawLenses(lenses) {
  for (const lensName in lenses) {
    const lens = lenses[lensName];
    const rgbAdditiveString =
      "rgb(" +
      lens.color[0] +
      ", " +
      lens.color[1] +
      ", " +
      lens.color[2] +
      ")";
    drawLens(lens, rgbAdditiveString);
  }
}
function drawBezierCurve(
  controlPointX,
  controlPointY,
  startX,
  startY,
  endX,
  endY
) {
  ctx.beginPath();
  ctx.moveTo(lowerIntersectionX, lowerIntersectionY);
  ctx.quadraticCurveTo(
    baseCircle.x,
    baseCircle.y,
    upperIntersectionX,
    upperIntersectionY
  );
  ctx.stroke(); //Theoretically this color is the additive color from moveCircle()

  //Start and end points
  ctx.fillStyle = "blue";
  ctx.beginPath();
  ctx.arc(lowerIntersectionX, lowerIntersectionY, 5, 0, 2 * Math.PI); // Start point
  ctx.arc(upperIntersectionX, upperIntersectionY, 5, 0, 2 * Math.PI); // End point
  ctx.fill();

  //Control point
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(baseCircle.x, baseCircle.y, 5, 0, 2 * Math.PI);
  ctx.fill();
}
function drawReuleauxTriangles(reuleauxTriangles) {
  for (let reuleauxTriangleName in reuleauxTriangles) {
    const reuleauxTriangle = reuleauxTriangles[reuleauxTriangleName];
    drawReuleauxTriangle(reuleauxTriangle);
  }
}
function drawReuleauxTriangle(reuleauxTriangle) {
  console.log(reuleauxTriangle);
  ctx.beginPath();
  const rgbArray = colorAddition(
    ...colorAddition(
      ...reuleauxTriangle.point1.color,
      ...reuleauxTriangle.point2.color
    ),
    ...reuleauxTriangle.point3.color
  );
  const rgbAdditiveString =
    "rgb(" + rgbArray[0] + ", " + rgbArray[1] + ", " + rgbArray[2] + ")";
  ctx.fillStyle = rgbAdditiveString;
  //Inner Triangle
  ctx.moveTo(
    reuleauxTriangle.point1.intersectionCoordinates.x,
    reuleauxTriangle.point1.intersectionCoordinates.y
  );
  ctx.lineTo(
    reuleauxTriangle.point2.intersectionCoordinates.x,
    reuleauxTriangle.point2.intersectionCoordinates.y
  );
  ctx.lineTo(
    reuleauxTriangle.point3.intersectionCoordinates.x,
    reuleauxTriangle.point3.intersectionCoordinates.y
  );
  ctx.closePath();
  ctx.fill();
  //3 arcs
  ctx.beginPath();
  ctx.arc(
    reuleauxTriangle.point1.baseCircle.x,
    reuleauxTriangle.point1.baseCircle.y,
    reuleauxTriangle.point1.baseCircle.radius,
    reuleauxTriangle.point1.baseCircleAngle,
    reuleauxTriangle.point2.baseCircleAngle
  );
  ctx.fill();

  console.log(reuleauxTriangle.point1.intersectionCoordinates);
  console.log(reuleauxTriangle.point2.intersectionCoordinates);
  ctx.arc(
    reuleauxTriangle.point2.toCircle.x,
    reuleauxTriangle.point2.toCircle.y,
    reuleauxTriangle.point2.toCircle.radius,
    reuleauxTriangle.point2.toCircleAngle,
    reuleauxTriangle.point3.baseCircleAngle
  );
  ctx.fill();
  ctx.arc(
    reuleauxTriangle.point3.toCircle.x,
    reuleauxTriangle.point3.toCircle.y,
    reuleauxTriangle.point3.toCircle.radius,
    reuleauxTriangle.point3.toCircleAngle,
    reuleauxTriangle.point1.toCircleAngle
  );
  ctx.fill();
}
//#endregion
//#region Get
function getMouseToCircleBoundaries(circle) {
  const dx = originalX - circle.x;
  const dy = originalY - circle.y;
  const angle = Math.atan2(dy, dx);
  return {
    boundaryX: circle.x + circle.radius * Math.cos(angle),
    boundaryY: circle.y + circle.radius * Math.sin(angle),
  };
}
function getCircleToCircleBoundaries(firstCircle, secondCircle) {
  const dx = firstCircle.x - secondCircle.x;
  const dy = firstCircle.y - secondCircle.y;
  const angle = Math.atan2(dy, dx);
  return {
    boundaryX: secondCircle.x + secondCircle.radius * Math.cos(angle),
    boundaryY: secondCircle.y + secondCircle.radius * Math.sin(angle),
  };
}
function getCircleToCircleOverlap(circles, numberOfCircles) {
  /*
      For each circle, get the check the distance of the center of the other circles in relation to it.
      We will be using the following mathematical principle:
      If the distance between the circles is greater than the sum of their radii, then they are overlapping.
      (x0 - x1) ^ 2 + (y0 - y1) ^ 2 < radiiSum ^ 2
  */
  let circleToCircleOverlap = {};
  for (let i = 0; i < numberOfCircles - 1; i++) {
    //Notice that we don't need to check the last circle.
    const baseCircleName = circles[i];
    const baseCircle = shapes[baseCircleName];
    //Notice here in this next loop that we offset.
    //For example: circle1 to circle2 is the same as circle2 to circle1, hence we only need one.
    for (let j = i + 1; j < numberOfCircles; j++) {
      const toCircleName = circles[j];
      const toCircle = shapes[toCircleName];
      //Check the distance between centers to determine overlap.
      const radiiSum = baseCircle.radius + toCircle.radius;
      const centerDifferenceX =
        (baseCircle.x - toCircle.x) * (baseCircle.x - toCircle.x);
      const centerDifferenceY =
        (baseCircle.y - toCircle.y) * (baseCircle.y - toCircle.y);
      const distanceBetweenCenters = Math.sqrt(
        centerDifferenceX + centerDifferenceY
      );
      if (!(distanceBetweenCenters > radiiSum)) {
        //OVERLAP
        if (!circleToCircleOverlap.hasOwnProperty(baseCircleName)) {
          circleToCircleOverlap[baseCircleName] = {};
        }
        circleToCircleOverlap[baseCircleName][toCircleName] = {};
        circleToCircleOverlap[baseCircleName][
          toCircleName
        ].distanceBetweenCenters = distanceBetweenCenters;
        circleToCircleOverlap[baseCircleName][toCircleName].boundaries =
          getCircleToCircleBoundaries(
            shapes[toCircleName],
            shapes[baseCircleName]
          );
      }
    }
  }
  //console.log(circleToCircleOverlap);
  return circleToCircleOverlap;
}
function getLensToLensBoundaries(firstLens, secondLens) {
  const dx = firstLens.centerX - secondLens.centerX;
  const dy = firstLens.centerY - secondLens.centerY;
  const angle = Math.atan2(dy, dx);
  return {
    boundaryX: secondLens.centerX + Math.cos(angle), //THIS INCOMPLETE, notice how in getCircleToCircleOverlap we have a radius to add on... here we don't and I don't know what to scale by to reach the boundary.
    boundaryY: secondLens.centerY + Math.sin(angle),
  };
}
//#endregion Get
//#region Check
/*
function checkFirstQuadrant(centerX, centerY, boundaryX, boundaryY) {
  // console.log("First Quad");
  // console.log({
  //     mouseXGreaterThanCenterX: originalX >= centerX,
  //     mouseYLessThanCenterY: originalY <= centerY,
  //     mouseXLessThanBoundaryX: originalX <= boundaryX,
  //     mouseYGreaterThanBoundaryY: originalY >= boundaryY
  // });
  return (originalX <= boundaryX
      && originalY >= boundaryY
      && originalX >= centerX
      && originalY <= centerY);
}
function checkSecondQuadrant(centerX, centerY, boundaryX, boundaryY) {
  // console.log("Second Quad");
  // console.log({
  //     mouseXLessThanCenterX: originalX <= centerX,
  //     mouseYLessThanCenterY: originalY <= centerY,
  //     mouseXGreaterThanBoundaryX: originalX >= boundaryX,
  //     mouseYGreaterThanBoundaryY: originalY >= boundaryY
  // });
  return (originalX >= boundaryX
      && originalY >= boundaryY
      && originalX <= centerX
      && originalY <= centerY);
}
function checkThirdQuadrant(centerX, centerY, boundaryX, boundaryY) {
  // console.log("Third Quad");
  // console.log({
  //     mouseXLessThanCenterX: originalX <= centerX,
  //     mouseYGreaterThanCenterY: originalY >= centerY,
  //     mouseXGreaterThanBoundaryX: originalX >= boundaryX,
  //     mouseYLessThanBoundaryY: originalY <= boundaryY
  // });
  return (originalX >= boundaryX
      && originalY <= boundaryY
      && originalX <= centerX
      && originalY >= centerY);
}
function checkFourthQuadrant(centerX, centerY, boundaryX, boundaryY) {
  // console.log("Fourth Quad");
  // console.log({
  //     mouseXGreaterThanCenterX: originalX >= centerX,
  //     mouseYGreaterThanCenterY: originalY >= centerY,
  //     mouseXLessThanBoundaryX: originalX <= boundaryX,
  //     mouseYLessThanBoundaryY: originalY <= boundaryY
  // });
  return (originalX <= boundaryX
      && originalY <= boundaryY
      && originalX >= centerX
      && originalY >= centerY);
}
function checkQuadrants(centerX, centerY, boundaryX, boundaryY) {
  //NOTE I am saying First, Second, etc. for the VISUAL quadrant because that makes more sense.
  //Remember, the coordinates within a display is inverted (the positive X and Y live in bottom right as opposed to positive X and negative Y in Cartesian plane)
  // console.log({
  //     firstQuad: checkFirstQuadrant(centerX, centerY, boundaryX, boundaryY),
  //     secondQuad: checkSecondQuadrant(centerX, centerY, boundaryX, boundaryY),
  //     thirdQuad: checkThirdQuadrant(centerX, centerY, boundaryX, boundaryY),
  //     fourthQuad: checkFourthQuadrant(centerX, centerY, boundaryX, boundaryY)
  // });
  return (checkFirstQuadrant(centerX, centerY, boundaryX, boundaryY)
      || checkSecondQuadrant(centerX, centerY, boundaryX, boundaryY)
      || checkThirdQuadrant(centerX, centerY, boundaryX, boundaryY)
      || checkFourthQuadrant(centerX, centerY, boundaryX, boundaryY));
}
*/
function checkBetweenTwoAngles(boundaries, pointToCheck) {
  /*
      Yes, this is inefficient.
      I know we will have two 'pointToCheck' for Upper and Lower angles.
      So I could duplicate the If checks in here
      BUT this is more modular, a heck of a lot easier to read, and the only way to make a function out of this.
      Sooooo sorry I made you loose a few microseconds.
  */
  if (
    Math.sign(boundaries.lowerBoundary) === 1 &&
    Math.sign(boundaries.upperBoundary) === -1
  ) {
    if (Math.sign(pointToCheck) == 1) {
      if (pointToCheck > boundaries.lowerBoundary) {
        return true;
      }
    } else {
      if (pointToCheck < boundaries.upperBoundary) {
        return true;
      }
    }
  } else {
    //If the boundaries are the same sign
    if (
      pointToCheck > boundaries.lowerBoundary &&
      pointToCheck < boundaries.upperBoundary
    ) {
      return true;
    }
  }
  return false;
}
//#endregion
function setActive(e) {
  //Determine original mouse position
  if (e.type == "touchstart") {
    originalX = e.touches[0].clientX + window.pageXOffset - canvas.offsetLeft;
    originalY = e.touches[0].clientY + window.pageYOffset - canvas.offsetTop;
  } else {
    originalX = e.clientX + window.pageXOffset - canvas.offsetLeft;
    originalY = e.clientY + window.pageYOffset - canvas.offsetTop;
    /*
          e.client X and Y represent the mouse's position.
          window.page X and Y Offset returns the pixels the current document has been scrolled from the upper left corner of the window, horizontally and vertically.
          element.offSet Left and Top returns the top position (in pixels) relative to the top of the offsetParent element.
      */
    // console.log({clientX: e.clientX, clientY: e.clientY,});
    // console.log({windowOffsetX: window.pageXOffset, windowOffsetY: window.pageYOffset});
    // console.log({canvasParent: canvas.offsetParent, canvasOffSetX: canvas.offsetLeft, canvasOffsetY: canvas.offsetTop});
    // console.log({mouseX: originalX, mouseY: originalY});
  }
  /*
      We are going to want to determine if the mouse is ontop of the circles, then if it is, move the circle.
      I will need to loop through the list backwards since I want to start at the top (the Canvas renders items on top of each other).
  */
  const reverseOrderShapes = Object.keys(shapes).reverse();
  for (const circleName of reverseOrderShapes) {
    const circle = shapes[circleName];

    /*
          Just for giggles, I built this CheckQuadrants function.
          It literally takes the mouse coordinate and checks each quadrant of each circle to see if it sits inside it...
          Yeah the circle formula, aka checkAgainstCenter, is a whole magnitude faster.

          To understand the mouseToCircleBoundaries variable: http://jsfiddle.net/1whpsb67/
      */
    // console.time("checkQuadrants");
    // const mouseToCircleBoundaries = getMouseToCircleBoundaries(circle);
    // checkQuadrants(circle.x, circle.y, mouseToCircleBoundaries.boundaryX, mouseToCircleBoundaries.boundaryY);
    // console.timeEnd("checkQuadrants");

    //console.time("checkAgainstCenter");
    const radiiSquared = circle.radius * circle.radius;
    const centerDifferenceX = (originalX - circle.x) * (originalX - circle.x);
    const centerDifferenceY = (originalY - circle.y) * (originalY - circle.y);
    const mouseInsideCircle =
      centerDifferenceX + centerDifferenceY < radiiSquared;
    //console.timeEnd("checkAgainstCenter");

    if (mouseInsideCircle) {
      currentCircle = circle;
      setInputs(...circle.color);
      break;
    }
  }
}
function removeActive() {
  if (currentCircle != null) {
    lastCircle = currentCircle;
    currentCircle = null;
  }
}
function moveCircle(e) {
  if (currentCircle != null) {
    //Determine current mouse position
    if (e.type == "touchstart") {
      var mouseX =
        e.touches[0].clientX + window.pageXOffset - canvas.offsetLeft;
      var mouseY = e.touches[0].clientY + window.pageYOffset - canvas.offsetTop;
    } else {
      var mouseX = e.clientX + window.pageXOffset - canvas.offsetLeft;
      var mouseY = e.clientY + window.pageYOffset - canvas.offsetTop;
    }
    //Calculate the movement difference
    const mouseDifferenceX = mouseX - originalX;
    const mouseDifferenceY = mouseY - originalY;
    //Using pointer currentCircle, update it's center position and redraw it.
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    currentCircle.x += mouseDifferenceX;
    currentCircle.y += mouseDifferenceY;
    drawCircles();
    //Required variables to build new objects.
    let circles = Object.keys(shapes);
    let numberOfCircles = circles.length;
    //We calculate the overlaps, specifically in reverse order so we can draw the layer color correctly.
    //Try removing the .reverse() function and see what happens. (If we didn't do it in reverse, the subsequent lens of additive color wouldn't even be seen.)
    let circleToCircleOverlap = getCircleToCircleOverlap(
      circles,
      numberOfCircles
    );
    //Loop through each overlap and draw the lens/lenses.
    if (Object.keys(circleToCircleOverlap).length > 0) {
      let lenses = {};
      for (const circle in circleToCircleOverlap) {
        const baseCircleOverlaps = circleToCircleOverlap[circle];
        const baseCircle = shapes[circle];
        for (const overlappedCircle in baseCircleOverlaps) {
          /*
                      Mathematical implementation for Intersection of Two Circles - Per Paul Bourke http://paulbourke.net/geometry/circlesphere/
                      Per Paul Bourke's proof, we are trying to find P2 (the center coordinates of the lens) and h (the distance from the center of the lens to an intersection).
                      P0 is the center of the first circle referenced as (x0, y0).
                      P1 is the center of the second circle referenced as (x1, y1).
                      P2 is the center of the lens that's created as (x2, y2).
                      P3 is the intersection of the circles as (x3, y3). Note there are two sets of coordinates, hence the plus/minus.
                      'd' is the distance between the two circle centers (which we calculated above).
                      'h' is the height of the lens.

                      Here are the equations we need.
                      d = a + b --------------------------- The distance between circles.
                      a = (r0 ^ 2 - r1 ^ 2 + d ^ 2) / 2d -- The distance from circle one's center to the center of the lens.
                      h = r0 ^ 2 - a ^ 2 ------------------ The distance from the center of the lens to an intersection.
                      P2 = P0 + a(P1 - P0) / d ------------ The center of the lens.
                      x3 = x2 +- h(y1 - y0) / d ----------- The x coordinate of the intersection.
                      y3 = y2 -+ h(x1 - x0) / d ----------- The y coordinate of the intersection.
                  */
          const toCircle = shapes[overlappedCircle];

          //We have d
          const distanceBetweenCenters =
            baseCircleOverlaps[overlappedCircle].distanceBetweenCenters;

          //Square of base circle radius
          const baseCircleRadiusSquare = baseCircle.radius * baseCircle.radius;

          //Calculate 'a'
          const circleCenterToLensCenterDistance =
            (baseCircleRadiusSquare -
              toCircle.radius * toCircle.radius +
              distanceBetweenCenters * distanceBetweenCenters) /
            (2 * distanceBetweenCenters);

          //Calculate P2 coordinates
          const lensCenterX =
            baseCircle.x +
            (circleCenterToLensCenterDistance * (toCircle.x - baseCircle.x)) /
              distanceBetweenCenters;
          const lensCenterY =
            baseCircle.y +
            (circleCenterToLensCenterDistance * (toCircle.y - baseCircle.y)) /
              distanceBetweenCenters;

          //Calculate 'h'
          const lensHeight = Math.sqrt(
            baseCircleRadiusSquare -
              circleCenterToLensCenterDistance *
                circleCenterToLensCenterDistance
          );

          //Calculate P3 coordinates aka x3 and y3
          /*
                      I name them Upper and Lower in the context of their values per the case within the proof.
                      Within the proof, Circle 1 is intersecting from the top right.
                      Remember, within the HTML Canvas, larger values appear visually lower.
                  */
          const differenceOfYScaledByHeightOverDistance =
            (lensHeight * (toCircle.y - baseCircle.y)) / distanceBetweenCenters;
          const differenceOfXScaledByHeightOverDistance =
            (lensHeight * (toCircle.x - baseCircle.x)) / distanceBetweenCenters;

          const upperIntersectionX =
            lensCenterX + differenceOfYScaledByHeightOverDistance;
          const upperIntersectionY =
            lensCenterY - differenceOfXScaledByHeightOverDistance;

          const lowerIntersectionX =
            lensCenterX - differenceOfYScaledByHeightOverDistance;
          const lowerIntersectionY =
            lensCenterY + differenceOfXScaledByHeightOverDistance;

          const lensName = "lens" + parseInt(Object.keys(lenses).length + 1);
          //If you'd like, you can convert the angles here from Radians to Degrees: Math.atan2(y, x) * 180 / Math.PI
          lenses[lensName] = {
            id: parseInt(Object.keys(lenses).length + 1),
            centerX: lensCenterX,
            centerY: lensCenterY,
            intersection: {
              upper: {
                x: upperIntersectionX,
                y: upperIntersectionY,
              },
              lower: {
                x: lowerIntersectionX,
                y: lowerIntersectionY,
              },
            },
            angles: {
              baseCircle: {
                upperAngle: Math.atan2(
                  upperIntersectionY - baseCircle.y,
                  upperIntersectionX - baseCircle.x
                ),
                lowerAngle: Math.atan2(
                  lowerIntersectionY - baseCircle.y,
                  lowerIntersectionX - baseCircle.x
                ),
              },
              toCircle: {
                upperAngle: Math.atan2(
                  upperIntersectionY - toCircle.y,
                  upperIntersectionX - toCircle.x
                ),
                lowerAngle: Math.atan2(
                  lowerIntersectionY - toCircle.y,
                  lowerIntersectionX - toCircle.x
                ),
              },
            },
            baseCircle: baseCircle,
            toCircle: toCircle,
            color: colorAddition(...baseCircle.color, ...toCircle.color),
          };
          //It's also fun to draw a Quadratic Bézier curve
          //drawBezierCurve(controlPointX, controlPointY, startX, startY, endX, endY);
        }
      }
      /*
              If lenses overlap, then we need to account for the additive color and draw it last so it will be ontop of the view stack.
              Just the same if we detect a Reuleaux Triangle, we need to draw it last.

              If we have 3 lenses, check each set of intersection points to see if another set of intersection points live inside it.
              - If both points live inbetween another set of points, one lens is inside another.
              - If only one point lives inside another (and this happens twice), we have a Reuleaux Triangle.

              AND to go even further, we need to make sure we are viewing the correct relationship of lenses.
              Think of the case where you have 3 lenses from just 3 circles.
              Lens 1 is made of Circle 1 and Circle 2.
              Lens 2 is made of Circle 1 and Circle 3.
              Lens 3 is made of Circle 2 and Circle 3.

              Notice the pattern we care about: find the lens which is made of the toCircles of two other lenses whose baseCircles match.
          */
      //console.log(lenses);
      if (Object.keys(lenses).length > 2) {
        /*
                  Notice, if you turn on lensDebug you will see how sometimes the intersection points (blue and red) and flipped depending on the circle you look at.
                  For example, horizontally align the circles from left to right in this order: blue, red, green with red and green overlapping.
                  From the left, move the blue circle to overlap the yellow lens. Note the top and bottom intersection point colors.
                  Now move the blue circle to the right of green and move it left to overlap the yellow lens. See how the intersection points flipped?

                  This is from how we are calculating the intersection points to begin with. It's all about who is the baseCircle and toCircle.
                  If you change the 'circles' variable above to equal Object.keys(shapes).reverse(), the intersection points colors would flip.
              */
        const lensesNames = Object.keys(lenses);
        const onTopLenses = {};
        const reuleauxTriangles = {};
        for (let i = 0; i < lensesNames.length - 2; i++) {
          const baseLens = lenses[lensesNames[i]];
          for (let j = i + 1; j < lensesNames.length - 1; j++) {
            const toLens = lenses[lensesNames[j]];
            //Check if baseCircles are the same
            if (baseLens.baseCircle.id === toLens.baseCircle.id) {
              //Check if a third lens fits the toCircles
              for (let k = j + 1; k < lensesNames.length; k++) {
                const thirdLens = lenses[lensesNames[k]];
                if (
                  baseLens.toCircle.id === thirdLens.baseCircle.id &&
                  toLens.toCircle.id === thirdLens.toCircle.id
                ) {
                  const reuleauxTriangle = {};
                  /*
                                      Since the baseCircles are the same, we want to see if the intersection points of either lens are inside the other.

                                      If both points of one lens is inside the other, then one lens is inside the other and we add it to onTopLenses.
                                      If one point of the lens is inside the other, then we potentially have a Reuleaux Triangle. We save the point and look for the third lens required for the Reuleaux Triangle.

                                      To imagine the if statements below that are doing the > and < comparisons, take the green circle (circle 2) and rotate it around the red circle (circle 1) with "Lens Center and Intersections Debug" on.
                                      Notice the position of the upper (blue) and lower (red) intersection points.
                                  */
                  //We compare Base to Base here
                  const baseLensBaseCircleBoundaries = {
                    lowerBoundary: baseLens.angles.baseCircle.upperAngle,
                    upperBoundary: baseLens.angles.baseCircle.lowerAngle,
                  };
                  let toLensLowerInsideBaseLens = checkBetweenTwoAngles(
                    baseLensBaseCircleBoundaries,
                    toLens.angles.baseCircle.lowerAngle
                  );
                  let toLensUpperInsideBaseLens = checkBetweenTwoAngles(
                    baseLensBaseCircleBoundaries,
                    toLens.angles.baseCircle.upperAngle
                  );

                  if (toLensLowerInsideBaseLens && toLensUpperInsideBaseLens) {
                    //If both points of toLens are inside baseLens, so we add it to onTopLenses
                    const onTopLens = toLens;
                    onTopLens.color = colorAddition(
                      ...baseLens.color,
                      ...toLens.color
                    );
                    onTopLenses[lensesNames[j]] = toLens;
                    continue;
                  } else if (
                    toLensLowerInsideBaseLens ||
                    toLensUpperInsideBaseLens
                  ) {
                    const point1 = {
                      id: 1,
                      baseCircle: toLens.baseCircle,
                      toCircle: toLens.toCircle,
                      color: toLens.color,
                    };
                    if (toLensLowerInsideBaseLens) {
                      point1.intersectionCoordinates =
                        toLens.intersection.lower;
                      point1.baseCircleAngle =
                        toLens.angles.baseCircle.lowerAngle;
                      point1.toCircleAngle = toLens.angles.toCircle.lowerAngle;
                    } else {
                      //toLensUpperInsideBaseLens
                      point1.intersectionCoordinates =
                        toLens.intersection.upper;
                      point1.baseCircleAngle =
                        toLens.angles.baseCircle.upperAngle;
                      point1.toCircleAngle = toLens.angles.toCircle.upperAngle;
                    }
                    reuleauxTriangle.point1 = point1;
                  }

                  //The second Reuleaux Point - inverse check of the first Reuleaux Point - toLens against baseLens
                  const toLensBaseCircleBoundaries = {
                    lowerBoundary: toLens.angles.baseCircle.upperAngle,
                    upperBoundary: toLens.angles.baseCircle.lowerAngle,
                  };
                  let baseLensLowerInsideToLens = checkBetweenTwoAngles(
                    toLensBaseCircleBoundaries,
                    baseLens.angles.baseCircle.lowerAngle
                  );
                  let baseLensUpperInsideToLens = checkBetweenTwoAngles(
                    toLensBaseCircleBoundaries,
                    baseLens.angles.baseCircle.upperAngle
                  );
                  if (baseLensLowerInsideToLens || baseLensUpperInsideToLens) {
                    const point2 = {
                      id: 2,
                      baseCircle: baseLens.baseCircle,
                      toCircle: baseLens.toCircle,
                      color: baseLens.color,
                    };
                    if (baseLensLowerInsideToLens) {
                      point2.intersectionCoordinates =
                        baseLens.intersection.lower;
                      point2.baseCircleAngle =
                        baseLens.angles.baseCircle.lowerAngle;
                      point2.toCircleAngle =
                        baseLens.angles.toCircle.lowerAngle;
                    } else {
                      //baseLensUpperInsideToLens
                      point2.intersectionCoordinates =
                        baseLens.intersection.upper;
                      point2.baseCircleAngle =
                        baseLens.angles.baseCircle.upperAngle;
                      point2.toCircleAngle =
                        baseLens.angles.toCircle.upperAngle;
                    }
                    reuleauxTriangle.point2 = point2;
                  }

                  //We compare baseLensToCircle to thirdLensBaseCircle here
                  const baseLensToCircleBoundaries = {
                    //Notice that we flipped the boundaries
                    lowerBoundary: baseLens.angles.toCircle.lowerAngle,
                    upperBoundary: baseLens.angles.toCircle.upperAngle,
                  };
                  const thirdLensBaseCircleAngles = {
                    upperAngle: thirdLens.angles.baseCircle.upperAngle,
                    lowerAngle: thirdLens.angles.baseCircle.lowerAngle,
                  };
                  let thirdLensLowerInsideBaseLens = checkBetweenTwoAngles(
                    baseLensToCircleBoundaries,
                    thirdLensBaseCircleAngles.lowerAngle
                  );
                  let thirdLensUpperInsideBaseLens = checkBetweenTwoAngles(
                    baseLensToCircleBoundaries,
                    thirdLensBaseCircleAngles.upperAngle
                  );

                  if (
                    thirdLensLowerInsideBaseLens &&
                    thirdLensUpperInsideBaseLens
                  ) {
                    //If both points of third are inside baseLens, so we add it to onTopLenses
                    const onTopLens = thirdLens;
                    onTopLens.color = colorAddition(
                      ...baseLens.color,
                      ...thirdLens.color
                    );
                    onTopLenses[lensesNames[k]] = thirdLens;
                    continue;
                  } else if (
                    thirdLensLowerInsideBaseLens ||
                    thirdLensUpperInsideBaseLens
                  ) {
                    const point3 = {
                      id: 3,
                      baseCircle: thirdLens.baseCircle,
                      toCircle: thirdLens.toCircle,
                      color: thirdLens.color,
                    };
                    if (thirdLensLowerInsideBaseLens) {
                      point3.intersectionCoordinates =
                        thirdLens.intersection.lower;
                      point3.baseCircleAngle =
                        thirdLens.angles.baseCircle.lowerAngle;
                      point3.toCircleAngle =
                        thirdLens.angles.toCircle.lowerAngle;
                    } else {
                      //thirdLensUpperInsideBaseLens
                      point3.intersectionCoordinates =
                        thirdLens.intersection.upper;
                      point3.baseCircleAngle =
                        thirdLens.angles.baseCircle.upperAngle;
                      point3.toCircleAngle =
                        thirdLens.angles.toCircle.upperAngle;
                    }
                    reuleauxTriangle.point3 = point3;
                  }

                  if (Object.keys(reuleauxTriangle).length === 3) {
                    //If we have 3 points
                    //Add it to the list of Reuleaux Triangles
                    //console.log(reuleauxTriangle);
                    const reuleauxTriangleName =
                      "reuleaux" +
                      parseInt(Object.keys(reuleauxTriangles).length + 1);
                    reuleauxTriangles[reuleauxTriangleName] = reuleauxTriangle;
                  }
                }
              }
            } else {
              continue;
            }
          }
        }
        //console.log(onTopLenses);
        //Create list of lenses without those in onTopLenses
        const regularLenses = {};
        for (let lensName in lenses) {
          if (!onTopLenses.hasOwnProperty(lensName)) {
            regularLenses[lensName] = lenses[lensName];
          }
        }
        drawLenses(regularLenses);
        if (Object.keys(onTopLenses).length > 0) drawLenses(onTopLenses);
        if (Object.keys(reuleauxTriangles).length > 0)
          drawReuleauxTriangles(reuleauxTriangles);
        //Visually see the points that make up the Reuleaux Triangle
        if (reuleauxDebug) reuleauxPointsDebug(reuleauxTriangles);
      } else {
        drawLenses(lenses);
      }
      //Visually see the center of the lens and points of intersection.
      if (lensDebug) lensCenterAndIntersectionsDebug(lenses);
    }
    //#region DEMONSTRATION OF ability to draw circle between primary circles:
    //Distance formula / 2 gives radius
    // let differenceX = Math.pow((circleToCircleBoundaries.circle1.circle2.boundaryX - circleToCircleBoundaries.circle2.circle1.boundaryX), 2);
    // let differenceY = Math.pow((circleToCircleBoundaries.circle1.circle2.boundaryY - circleToCircleBoundaries.circle2.circle1.boundaryY), 2);
    // let distanceRedtoGreen = Math.sqrt(differenceX + differenceY);
    // let radius = distanceRedtoGreen / 2;
    //Midpoint formula gives center coordinates
    // let centerX = (circleToCircleBoundaries.circle1.circle2.boundaryX + circleToCircleBoundaries.circle2.circle1.boundaryX) / 2;
    // let centerY = (circleToCircleBoundaries.circle1.circle2.boundaryY + circleToCircleBoundaries.circle2.circle1.boundaryY) / 2;
    // drawCircle(centerX, centerY, radius, )
    // ctx.stroke();
    //#endregion
    //MOUSE DEBUG
    if (mouseDebug)
      mouseToCircleBoundariesDebug(mouseX, mouseY, circles, numberOfCircles);
    //CIRCLE DEBUG - Illustration of boundaries
    if (circleBoundaryDebug)
      circleToCircleBoundariesDebug(circles, numberOfCircles);
    //Update the original position to the new coordinates.
    originalX = mouseX;
    originalY = mouseY;
  }
}
