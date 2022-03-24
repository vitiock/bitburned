import {canReap, getExploitableServers} from './targeting.js'

/** @param {NS} ns **/
export async function main(ns) {
  ns.tprint("--- Exploitable")
  let hosts = getExploitableServers(ns);
  hosts.map( (host, index) => {
    ns.tprint(host.hostname + ' - ' + canReap(ns, host, 5));
  })
}