/**
 *
 * @param {NS} ns
 */
export async function main(ns) {
  let factionData = ns.read('/temp/current-faction-favor.txt')
  if(!factionData){
    ns.print("/temp/current-factions.txt is empty");
  }
  factionData = JSON.parse(factionData)
  let factionStats = [];

  for(let faction of factionData){
    let factionStat = {
      name: faction.name,
      rep: faction.rep,
      favor: faction.favor,
      favorGain: Math.floor(ns.getFactionFavorGain(faction.name))
    }
    factionStats.push(factionStat)
  }

  await ns.write('/temp/faction-stats.txt', JSON.stringify(factionStats, null, 2), 'w');
}