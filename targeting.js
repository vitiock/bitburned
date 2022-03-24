import { getOwnedServers } from './helpers.js'

/** @param {NS} ns
 * @returns {Server[]}
 * **/
export function getExploitableServers(ns) {
  let ownedHosts = getOwnedServers(ns);
  let exploitableHosts = ownedHosts.filter( server => {
    if(server.moneyMax == server.moneyAvailable && server.minDifficulty == server.hackDifficulty && server.moneyMax > 0){
      return true;
    }

    return false;
  })

  return exploitableHosts;
}

/**
 *
 * @param {NS} ns
 * @param {Server} server
 * @param {number} percent
 */
export function canReap(ns, server, percent) {
  return ns.fileExists('/reap/' + percent + '-' + server.hostname)
}