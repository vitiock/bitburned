/** @param {NS} ns **/
import {getAllServers} from "./helpers";

export async function main(ns) {
  let servers = getAllServers(ns)
  for(let server of servers) {
    if(ns.ls(server.hostname, "cct").length > 0) {
      ns.tprint("===" + server.hostname);
      let contracts = ns.ls(server.hostname, "cct");
      ns.tprint(JSON.stringify(contracts));
      for(let i = 0; i < contracts.length; i++){
        ns.tprint("Contract Filename: " + contracts[i]);
        ns.tprint(ns.codingcontract.getContractType(contracts[i], server.hostname));
        ns.tprint(ns.codingcontract.getDescription(contracts[i], server.hostname));
        ns.tprint(ns.codingcontract.getData(contracts[i], server.hostname));
      }
    }
  }
}