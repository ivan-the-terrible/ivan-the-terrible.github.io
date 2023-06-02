import { CollisionType } from "./CollisionTypeEnum.js";

export function findCanvasCollision(movingObject, canvasWidth, canvasHeight) {
  const xSide = determineCanvasCollisionX(movingObject, canvasWidth);
  const ySide = determineCanvasCollisionY(movingObject, canvasHeight);
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

function determineCanvasCollisionX(movingObject, canvasWidth) {
  const futureX = movingObject.futureX();

  switch (true) {
    case futureX > canvasWidth:
      return CollisionType.Right;

    case futureX < 0:
      return CollisionType.Left;

    default:
      return "";
  }
}

function determineCanvasCollisionY(movingObject, canvasHeight) {
  const futureY = movingObject.futureY();

  switch (true) {
    case futureY > canvasHeight:
      return CollisionType.Bottom;

    case futureY < 0:
      return CollisionType.Top;

    default:
      return "";
  }
}
