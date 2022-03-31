const argsSchema = [
  ['value', ''],
]

const EAST = 0;
const SOUTH = 1;
const WEST = 2;
const NORTH = 3;

/** @param {NS} ns **/
export async function main(ns) {
  let flags = ns.flags(argsSchema);
  let spiralMatrix = JSON.parse(flags['value']);
  let xEnd = spiralMatrix[0].length;
  let xStart = 0;
  let yEnd = spiralMatrix.length;
  let yStart = 0;
  let yStop = yEnd-1;
  let xStop = xEnd-1;

  let currX = 0;
  let currY = 0;
  let direction = EAST;

  let answer = [];

  while(true) {
    answer.push(spiralMatrix[currY][currX])
    if(direction === EAST) {
      currX += 1;
      if(currX === xStop) {
        direction = SOUTH
        yStart += 1;
      }
    } else if (direction === SOUTH) {
      currY += 1;

      if(currY === yStop) {
        direction = WEST
        xStop -= 1;
      }
    } else if (direction === WEST) {
      currX -= 1;
      if(currX === xStart) {
        direction = NORTH
        yStop -= 1;
      }
    } else if (direction === NORTH) {
      currY -= 1;
      if(currY === yStart) {
        direction = EAST;
        xStart += 1;
      }
    }

    if(xStop <= xStart && xStop === currX && yStart >= yStop && yStop === currY){
      answer.push(spiralMatrix[currY][currX])
      break;
    }
  }

  await ns.write('/temp/spiral.txt', JSON.stringify(answer, null, 2), 'w');
}