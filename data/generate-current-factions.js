/**
 *
 * @param {NS} ns
 */
export async function main(ns) {
  let factionData = [];
  let playerFactions = ns.getPlayer().factions;
  for(let faction of playerFactions){
    let factionStats = {
      name: faction,
    }
    factionData.push(factionStats)
  }

  await ns.write('/temp/current-factions.txt', JSON.stringify(factionData, null, 2), 'w');
}