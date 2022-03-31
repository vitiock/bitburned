const argsSchema = [
  ['value', '[]'],
]

function findPaths(currentX, currentY, maxX, maxY){
  let totalPaths = 0;
  if(currentX < maxX) {
    totalPaths += findPaths(currentX+1, currentY, maxX, maxY);
  }
  if(currentY < maxY) {
    totalPaths += findPaths( currentX, currentY+1, maxX, maxY);
  }

  if(currentX === maxX && currentY === maxY){
    return 1;
  }
  return totalPaths;
}


/** @param {NS} ns **/
export async function main(ns) {
  let flags = ns.flags(argsSchema);

  let size = JSON.parse(flags['value']);
  ns.tprint("Size: ["+size[0]+","+size[1]+"]");
  let paths = findPaths(0, 0, size[0]-1, size[1]-1);
  await ns.write('/temp/unique-paths-grid-one.txt', paths, 'w');
  ns.tprint(paths);
}