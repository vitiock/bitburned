const argsSchema = [
  ['faction', 'ERROR'],
  ['callback', '']
]

/**
 *
 * @param {NS} ns
 */
export async function main(ns) {
  let flags = ns.flags(argsSchema);
  if(flags['faction'] === 'ERROR'){
    throw("unlock-faction.js called without a specified faction");
  }

  let factionUnlocks = JSON.parse(ns.read('/static-data/faction-unlocks.txt'));

  while (!ns.getPlayer().factions.includes(flags['faction'])) {
    await ns.sleep(1000);
  }

  //Kill started script
  //Execute callback script
}