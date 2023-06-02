/**
 * This class serves as an intializable enum to contain
 * the coordinates of the canvas.
 */
export class Corners {
  TopLeft = { x: 0, y: 0 };
  TopRight;
  BottomLeft;
  BottomRight;
  constructor(canvas) {
    this.TopRight = { x: canvas.width, y: 0 };
    this.BottomLeft = { x: 0, y: canvas.height };
    this.BottomRight = { x: canvas.width, y: canvas.height };
  }
}
