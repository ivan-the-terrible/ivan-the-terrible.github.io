/**
 * @readonly
 * @enum {string}
 */
const TextDirection = {};

TextDirection[(TextDirection[0] = "LeftToRight")] = 0;
TextDirection[(TextDirection[1] = "Diagonal")] = 1;
TextDirection[(TextDirection[2] = "ReverseDiagonal")] = 2;

Object.freeze(TextDirection);

export { TextDirection };
