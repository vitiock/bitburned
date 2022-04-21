/** @param {NS} ns **/
import {loadCycleState} from "/helpers";

let denyListedFactions = ['Sector-12', 'Chongqing', 'Aevum']

//const argsSchema = [
//]

/**
 *
 * @param {NS} ns
 */
export async function main(ns) {
  //let flags = ns.flags(argsSchema);

  let factionInvites = ns.checkFactionInvitations()
  let cycleState = loadCycleState(ns);
  for (let i = 0; i < factionInvites.length; i++) {
    let faction = factionInvites[i];
    let factions = cycleState.cycleFactions.map( faction => faction.name)
    if(!denyListedFactions.includes(faction) || factions.includes(faction)) {
      ns.joinFaction(faction);
      ns.toast("Joined faction: " + faction);
    }
  }
}