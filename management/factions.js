/** @param {NS} ns **/

import {loadCycleState} from "./helpers";

let favoredWork = {
  'Tetrads': 'Field Work',
  'Slum Snakes': 'Field Work',
  'NiteSec': 'Hacking Contracts',
  'Chongqing': 'Hacking Contracts',
  'Netburners': 'Hacking Contracts',
  'Tian Di Hui': 'Hacking Contracts',
  'CyberSec': 'Hacking Contracts',
  'The Black Hand': 'Hacking Contracts',
  'BitRunners': 'Hacking Contracts',
  'Sector-12': 'Hacking Contracts',
  'Daedalus': 'Hacking Contracts',
}

let denyListedFactions = ['Sector-12', 'Chongqing']

const argsSchema = [
  ['targetFaction', ''],
  ['duration', 60]
  ['focus', false]
]

/**
 *
 * @param {NS} ns
 */
export async function main(ns) {
  let isWorking = false;
  ns.atExit( () => {

  })

  let flags = ns.flags(argsSchema);
  if(favoredWork[flags['targetFaction']]) {
    ns.tprint("Targeting " + flags['targetFaction'] + " for rep (not really not implemented yet)");
  }

  ns.tprint("Starting Faction Manager")
  let focused = flags['focus']
  while(true) {
    let cycleState = loadCycleState(ns);
    let factionInvites = ns.checkFactionInvitations()
    for (let i = 0; i < factionInvites.length; i++) {
      let faction = factionInvites[i];
      if(!denyListedFactions.includes(faction)) {
        ns.joinFaction(faction);
        ns.toast("Joined faction: " + faction);
      }
    }

    if(favoredWork[flags['targetFaction']]){
      ns.workForFaction(flags['targetFaction'], favoredWork[favorNeeded[0].name], focused);
      await ns.sleep(60000);
      focused = ns.isFocused();
      ns.stopAction();
    } else {
      let factionData = JSON.parse(ns.read('/temp/faction-stats.txt'));
      if(cycleState.nextAction === 'Work4Faction') {
        ns.tprint("Should be working for a faction")
        ns.workForFaction(cycleState.nextActionDetails.target, favoredWork[cycleState.nextActionDetails.target], focused)
      } else {
        let favorNeeded = factionData.sort((a, b) => (a.favor + a.favorGain) - (b.favor + b.favorGain));
        ns.print("Favor needed: " + favorNeeded[0].name);
        ns.workForFaction(favorNeeded[0].name, favoredWork[favorNeeded[0].name], focused);
      }
    }
    await ns.sleep(60000);
    focused = ns.isFocused();
    ns.stopAction();
  }
}