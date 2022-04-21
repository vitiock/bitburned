/** @param {NS} ns **/

//const argsSchema = [
//]

import {loadCycleState} from "/helpers";

/**
 *
 * @param {NS} ns
 */
export async function main(ns) {
  //let flags = ns.flags(argsSchema);
  let cycleState = loadCycleState(ns);
  if(cycleState.cycleDuration > 60*60*1000) {
    return;
  }
  for(let i = 0; i < cycleState.cycleFactions.length; i++){
    if(cycleState.cycleFactions[i].currentFactionFavor >= 150){
      if(cycleState.cycleFactions[i].currentFactionRep < 150000) {
        ns.toast("Can purchase rep for " + cycleState.cycleFactions[i].name, 'info', 60000);
        ns.donateToFaction(cycleState.cycleFactions[i].name, Math.floor(ns.getPlayer().money - 5_000_000_000));
      }
    }
  }
}