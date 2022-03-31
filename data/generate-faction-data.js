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
      rep: ns.getFactionRep(faction),
      favor: ns.getFactionFavor(faction),
      favorGain: ns.getFactionFavorGain(faction)
    }
    factionData.push(factionStats)
  }

  await ns.write('/temp/faction-stats.txt', JSON.stringify(factionData, null, 2), 'w');
}