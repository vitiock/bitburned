const argsSchema = [
  ['value', '[]'],
]

function findPaths(currentX, currentY, map){
  let totalPaths = 0;
  if(currentX < map[0].length-1) {
    if(map[currentY][currentX+1] === 0) {
      totalPaths += findPaths(currentX + 1, currentY, map);
    }
  }
  if(currentY < map.length-1) {
    if(map[currentY+1][currentX] === 0) {
      totalPaths += findPaths( currentX, currentY+1, map);
    }
  }

  if(currentX === map[0].length-1 && currentY === map.length-1){
    return 1;
  }
  return totalPaths;
}


/** @param {NS} ns **/
export async function main(ns) {
  let flags = ns.flags(argsSchema);

  let map = JSON.parse(flags['value']);
  let paths = findPaths(0, 0, map);
  await ns.write('/temp/unique-paths-grid-two.txt', paths, 'w');
  ns.tprint(paths);
}