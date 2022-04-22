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
  'Illuminati': 'Hacking Contracts',
  'Fulcrum Secret Technologies': 'Hacking Contracts',
  'Clarke Incorporated': 'Hacking Contracts',
  'Aevum': 'Hacking Contracts',
}

let denyListedFactions = ['Sector-12', 'Chongqing']

const argsSchema = [
  ['targetFaction', ''],
  ['duration', 60],
  ['focus', true]
]

/**
 *
 * @param {NS} ns
 */
export async function main(ns) {


  let flags = ns.flags(argsSchema);

  if(!favoredWork[flags['targetFaction']]) {
    // Just exit if we don't know how to work this faction
    ns.toast("No favorite work for " + flags.targetFaction, 'error');
    ns.exit();
  }

  ns.tprint("Starting Faction Manager")
  let focused = flags['focus']
  if(!ns.workForFaction(flags['targetFaction'], favoredWork[flags['targetFaction']], focused)){
    ns.tprint("ERROR: failed to start working for faction");
  } else {
    await ns.sleep(flags['duration']);
  }
  ns.stopAction();
}