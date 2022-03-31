/** @param {NS} ns **/

let factionNames = [
  'Tetrads',
  'Slum Snakes',
  'NiteSec',
  'Chongqing',
  'Netburners',
  'Tian Di Hui',
  'CyberSec',
  'The Black Hand'
]

let hacking_stats = [
  "hacking_exp_mult",
  "hacking_speed_mult",
  "hacking_chance_mult",
  "hacking_mult"
]


/**
 *
 * @param {NS} ns
 */
export async function main(ns) {
  let mappedAugments = [];
  let augmentData = [];
  for(let faction of factionNames) {
    ns.tprint("Faction: " + faction);
    let factionAugments = ns.getAugmentationsFromFaction(faction);
    for(let augment of factionAugments) {
      if(mappedAugments.includes(augment)){
        continue;
      }
      //mappedAugments.push(augment);

      let stats = ns.getAugmentationStats(augment)
      let hackingAugment = false;
      for(let val of hacking_stats) {
        if(stats[val]){
          hackingAugment = true;
        }
      }

      augmentData.push({
        name: augment,
        faction: faction,
        hacking: hackingAugment,
        price: Math.ceil(ns.getAugmentationPrice(augment)),
        rep: Math.ceil(ns.getAugmentationRepReq(augment)),
        stats: stats
      })
    }
  }

  //ns.tprint(JSON.stringify(augmentData, null, 2));
  let purchasedAugments = ns.getOwnedAugmentations(true);
  let hackingAugments = augmentData.filter( augment => !purchasedAugments.includes(augment.name));
  hackingAugments = hackingAugments.filter( augment => augment.hacking);
  hackingAugments = hackingAugments.sort( (a, b) => a.price - b.price )

  let augmentList = [];
  for(let i = 0; i < hackingAugments.length; i++){
    if(!augmentList.includes(hackingAugments[i].name)){
      augmentList.push(hackingAugments[i].name)
    }
    if(augmentList.length === 5){
      break;
    }
  }


  let targetAugment = hackingAugments[0];
  let targetFaction = targetAugment.faction;
  ns.tprint(JSON.stringify(hackingAugments[0], null, 2));
  let neuroFluxPrice = Math.ceil(ns.getAugmentationPrice('NeuroFlux Governor'));
  let shouldBuyNeuroFluxFirst = false;
  if (neuroFluxPrice > targetAugment) {
    ns.tprint("Should upgrade neuroFlux first");
    shouldBuyNeuroFluxFirst = true;
  }

  let resetConfig = {
    targetAugment: targetAugment.name,
    targetFaction: targetFaction,
    augmentsByPrice: augmentList,
    buyNeuroFluxFirst: shouldBuyNeuroFluxFirst
  }
  ns.tprint(JSON.stringify(resetConfig, null, 2))
  ns.write('/temp/cycle-config.txt', JSON.stringify(resetConfig, null, 2), 'w');
}