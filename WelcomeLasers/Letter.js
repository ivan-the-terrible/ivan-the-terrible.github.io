export class Letter {
  character;
  width;
  height;
  x;
  y;
  xBox;
  yBox;
  dx;
  dy;
  actualBoundingBoxLeft;
  constructor(
    canvas,
    ctx,
    character,
    length,
    currentIndex,
    letterLayoutOption
  ) {
    this.character = character;
    this.#placeLetter(canvas, length, currentIndex, letterLayoutOption);

    const textMeasurements = ctx.measureText(character);
    this.width = textMeasurements.width;
    this.height = textMeasurements.actualBoundingBoxAscent;
    this.actualBoundingBoxLeft = textMeasurements.actualBoundingBoxLeft;

    this.xBox = this.getXBox();
    this.yBox = this.getYBox();
  }
  /**
   * Based on the letterLayoutOption provided,
   * calculations are made to determine where the letter ought to be placed.
   * @param {HTMLElement} canvas
   * @param {Number} length
   * @param {Number} currentIndex
   * @param {String} letterLayoutOption
   */
  #placeLetter(canvas, length, currentIndex, letterLayoutOption) {
    if (length == 1) {
      this.x = canvas.width / 2;
      this.y = canvas.height / 2;
    } else {
      const xBase = canvas.width / length;
      const yBase = canvas.height / length;

      //TODO: Maybe I put in a case that pops the letters up and down from the middle
      switch (letterLayoutOption) {
        case "Diagonal":
          this.x = xBase + xBase * currentIndex;
          this.y = yBase + yBase * currentIndex;
          //Keep it off the border
          if (currentIndex == 0) {
            this.y += 25;
          } else if (currentIndex == length - 1) {
            this.x -= 35;
          }
          break;

        case "ReverseDiagonal":
          this.x = xBase + xBase * currentIndex;
          this.y = yBase + yBase * (length - currentIndex);
          //Keep it off the border
          if (currentIndex == 0) {
            if (length > 6) {
              this.y -= 65;
            } else {
              this.y -= 100;
            }
          } else if (currentIndex == length - 1) {
            this.x -= 35;
            this.y -= 35;
          } else {
            this.y -= 55;
          }
          break;

        default:
          this.x = xBase + xBase * currentIndex;
          this.y = canvas.height / 2;
          if (currentIndex == length - 1) {
            this.x -= 35;
          }
          break;
      }
    }
  }
  getX() {
    return this.xBox + this.actualBoundingBoxLeft;
  }
  getY() {
    return this.yBox + this.height;
  }
  getXBox() {
    return this.x - this.actualBoundingBoxLeft;
  }
  getYBox() {
    return this.y - this.height;
  }
  futureX() {
    return this.x + this.dx;
  }
  futureY() {
    return this.y + this.dy;
  }
  moveX() {
    this.x = this.futureX();
  }
  moveY() {
    this.y = this.futureY();
  }
  moveLetterFromCanvas(side, canvas) {
    switch (side) {
      case "Right":
        this.dx *= -1;
        this.xBox = canvas.width;
        this.x = this.getX();
        break;

      case "Left":
        this.dx *= -1;
        this.xBox = 0;
        this.x = this.getX();
        break;

      case "Top":
        this.dy *= -1;
        this.yBox = 0;
        this.y = this.getY();
        break;

      case "Bottom":
        this.dy *= -1;
        this.yBox = canvas.height;
        this.y = this.getY();
        break;
    }
  }
}
