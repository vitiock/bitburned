import {canReap, getExploitableServers} from './targeting.js'

let importantServers = [
  'run4theh111z',
  'I.I.I.I',
  'avmnite-02h',
  'w0rld_d43m0n',
  'The-Cave'
]

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
    !server.hostname.startsWith('hacknet') &&
    server.hostname !== 'home') {
    allPaths.push(path);
  }

  let children = ns.scan(hostname);
  children.map((server) => {
    if(server !== previousHost) {
      let newPaths = expand(ns, server, hostname, path.slice());
      newPaths.map( (newPath) => {allPaths.push(newPath);})
    }
  })

  return allPaths;
}

async function backdoorPath(ns, path){
  for(let i = 1; i < path.length; i++){
    ns.connect(path[i]);
  }
  ns.toast("Installing backdoor on: " + path[path.length-1]);
  await ns.installBackdoor();
  await ns.sleep(10);
  for(let i = path.length-2; i >= 0; i--){
    ns.connect(path[i]);
  }
}

/** @param {NS} ns **/
export async function main(ns) {
  ns.disableLog('scan');
  let paths = expand(ns, 'home', null, Array());

  let importantPaths = paths.filter( path => {
    let toBackdoor = path[path.length-1];
    return importantServers.includes(toBackdoor)
  })

  if(importantPaths.length > 0) {
    ns.print("No important servers found")
    await backdoorPath(ns, importantPaths[0])
  } else if(paths.length > 0) {
    ns.print("Backdooring " + paths[0][paths[0].length-1])
    await backdoorPath(ns, paths[0]);
  }
}