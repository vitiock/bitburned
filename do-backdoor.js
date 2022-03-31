import {canReap, getExploitableServers} from './targeting.js'

/**
 *
 * @param {NS} ns
 * @param {string} hostname
 * @param {string | null} previousHost
 * @param {string[]} path
 * @returns {string[][]}
 *
 */
function expand(ns, hostname, previousHost, path) {
  let server = ns.getServer(hostname)
  if(!server.hasAdminRights) {
    return [];
  }

  path.push(hostname)

  let allPaths = [];
  if(!server.backdoorInstalled &&
    server.requiredHackingSkill < ns.getPlayer().hacking &&
    !server.hostname.startsWith('hax-') &&
    server.hostname !== 'home') {
    ns.toast("Server difficulty: " + server.requiredHackingSkill);
    allPaths.push(path);
  }

  let children = ns.scan(hostname);
  children.map((server) => {
    if(server != previousHost) {
      let newPaths = expand(ns, server, hostname, path.slice());
      newPaths.map( (newPath) => {allPaths.push(newPath);})
    }
  })

  return allPaths;
}

/** @param {NS} ns **/
export async function main(ns) {
  let paths = expand(ns, 'home', null, Array());

  for(let index = 0; index < paths.length; index++){
    let path = paths[index];
    for(let i = 1; i < path.length; i++){
      ns.tprint("Going to: " + path[i])
      ns.connect(path[i]);
    }
    ns.toast("Installing backdoor on: " + path[path.length-1]);
    await ns.installBackdoor();
    await ns.sleep(10);
    for(let i = path.length-2; i >= 0; i--){
      ns.tprint("Backtracking home via: " + path[i])
      ns.connect(path[i]);
    }
  }
}