export class Laser {
  x = 0;
  y = 0;
  dx = 5;
  dy = 5;
  futureX() {
    return this.x + this.dx;
  }
  futureY() {
    return this.y + this.dy;
  }
}
