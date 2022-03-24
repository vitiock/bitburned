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
  if(!server.backdoorInstalled && !server.hostname.startsWith('hax-')) {
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

  paths.map(path => {
    ns.tprint(path.join('->'));
  })
}