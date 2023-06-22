/**
 * A Laser has (x, y) coordinates and velocity (dx, dy).
 * The futureX() and futureY() determine the location plus velocity.
 */
export class Laser {
  x = 0;
  y = 0;
  dx = 9;
  dy = 9;
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
}
