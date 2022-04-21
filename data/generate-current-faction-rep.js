/**
 *
 * @param {NS} ns
 */
export async function main(ns) {
  let factionData = ns.read('/temp/current-factions.txt')
  if(!factionData){
    ns.print("/temp/current-factions.txt is empty");
  }
  factionData = JSON.parse(factionData)
  let factionStats = [];

  for(let faction of factionData){
    let factionStat = {
      name: faction.name,
      rep: Math.floor(ns.getFactionRep(faction.name)),
    }
    factionStats.push(factionStat)
  }

  await ns.write('/temp/current-faction-rep.txt', JSON.stringify(factionStats, null, 2), 'w');
}