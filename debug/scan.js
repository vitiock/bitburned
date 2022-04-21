/** @param {NS} ns **/
export async function main(ns) {


  let scanned = [];
  let targets = ['home']
  while(targets.length > 0){
    let target = targets.pop();
    ns.tprint("Target: " + target);

    let server = ns.getServer(target);
    ns.tprint(JSON.stringify(server, null, 2));

    let neighbors = ns.scan(target);
    for(let i = 0; i < neighbors.length; i++){
      let neighbor = neighbors[i]
      if(!scanned.includes(neighbor)){
        ns.tprint("Adding: " + neighbor)
        scanned.push(neighbor);
        targets.push(neighbor);
      }
    }
  }
}