let factionNames = [
  'Tetrads',
  'Slum Snakes',
  'NiteSec',
  'Chongqing',
  'Netburners',
  'Tian Di Hui',
  'CyberSec',
  'The Black Hand',
  'BitRunners',
  'Daedalus',
  'Sector-12',
  'Netburners',
  'MegaCorp',
  'OmniTek Incorporated',
  'ECorp',
  'KuaiGong International',
  'NWO',
  'Blade Industries',
  'Bachman & Associates',
  'Clarke Incorporated',
  'Fulcrum Secret Technologies',
  'The Covenant',
  'Illuminati',
  'New Tokyo',
  'Ishima',
  'Aevum',
  'Volhaven'
]

/**
 *
 * @param {NS} ns
 */
export async function main(ns) {
  let augments = {};
  for(let faction of factionNames) {
    ns.tprint("Faction: " + faction);
    let factionAugments = ns.getAugmentationsFromFaction(faction);
    for(let augment of factionAugments) {
      let stats = ns.getAugmentationStats(augment)

      if(augments[augment]){
        augments[augment].factions.push(faction);
      } else {
        let augmentData = {
          name: augment,
          factions: [faction],
          stats: stats
        };
        augments[augment] = augmentData
      }
    }
  }

  ns.write('/static-data/augments.txt', JSON.stringify(augments, null, 2), 'w');
}