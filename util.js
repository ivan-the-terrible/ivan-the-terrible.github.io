export function AttachEvents(element, type, handler) {
  element.addEventListener(type, handler);
}
/**
 * Following Bootstrap's criteria for response breakpoints, we determine font size.
 * @param {Number} canvasWidth
 * @returns {Number} a font size
 */
export function DetermineFontSize(canvasWidth) {
  const IsExtraSmall = screenSize => screenSize < 576;
  const IsSmall = screenSize => screenSize >= 576 && screenSize < 768;
  const IsMedium = screenSize => screenSize >= 768 && screenSize < 992;
  const IsLarge = screenSize => screenSize >= 992 && screenSize < 1200;
  const IsExtraLarge = screenSize => screenSize >= 1200;

  const screenSize = canvasWidth;
  const baseSize = 30;
  switch (true) {
    case IsExtraSmall(screenSize):
      return baseSize;
    case IsSmall(screenSize):
      return baseSize + 15;
    case IsMedium(screenSize):
      return baseSize * 2;
    case IsLarge(screenSize):
      return baseSize * 2 + 15;
    case IsExtraLarge(screenSize):
      return baseSize * 3;
  }
}
