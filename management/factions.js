/** @param {NS} ns **/

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
  'Sector-12': 'Hacking Contracts'
}

const argsSchema = [
  ['targetFaction', ''],
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

  let factionInvites = ns.checkFactionInvitations()
  for (let i = 0; i < factionInvites.length; i++) {
    let faction = factionInvites[i];
    ns.tprint("Faction invite for faction: " + faction);
  }



  ns.tprint("Starting Faction Manager")
  let focused = flags['focus']
  while(true) {
    let factionInvites = ns.checkFactionInvitations()
    for (let i = 0; i < factionInvites.length; i++) {
      let faction = factionInvites[i];
      // No doubt should check if we want to join the faction for city factions but oh well
      ns.joinFaction(faction);
      ns.toast("Joined faction: " + faction);
    }



    if(favoredWork[flags['targetFaction']]){
      ns.workForFaction(flags['targetFaction'], favoredWork[favorNeeded[0].name], focused);
      await ns.sleep(60000);
      focused = ns.isFocused();
      ns.stopAction();
    } else {
      let currentFactions = ns.getPlayer().factions
      let factions = [];
      for (let i = 0; i < currentFactions.length; i++) {
        let faction = currentFactions[i]
        let factionStats = {
          name: faction,
          rep: Math.floor(ns.getFactionRep(faction)),
          favor: Math.floor(ns.getFactionFavor(faction)),
          favorGain: Math.floor(ns.getFactionFavorGain(faction)),
        }
        factions.push(factionStats);
      }

      let favorNeeded = factions.sort((a, b) => (a.favor + a.favorGain) - (b.favor + b.favorGain));
      ns.print("Favor needed: " + favorNeeded[0].name);
      ns.workForFaction(favorNeeded[0].name, favoredWork[favorNeeded[0].name], focused);
    }
    await ns.sleep(60000);
    focused = ns.isFocused();
    ns.stopAction();
  }
}