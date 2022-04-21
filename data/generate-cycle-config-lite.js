/** @param {NS} ns **/

let factionNames = [
  'Tetrads',
  'Slum Snakes',
  'NiteSec',
  'Chongqing',
  'Netburners',
  'Tian Di Hui',
  'CyberSec',
  'Sector-12',
  'The Black Hand',
  'BitRunners',
  'Daedalus'
]

let hacking_stats = [
  "hacking_exp_mult",
  "hacking_speed_mult",
  "hacking_chance_mult",
  "hacking_money_mult",
  "hacking_grow_mult",
  "hacking_power",
  "hacking_mult"
]

let faction_stats = [
  'faction_rep_mult',
  'company_rep_mult'
]

let hacknet_stats = [

]

/**
 *
 * @param {NS} ns
 */
function loadAllAugments(ns) {
  let augments = JSON.parse(ns.read('/static-data/augments.txt'));
  ns.tprint("Loaded " + Object.keys(augments).length + " augments from file");
  return augments;
}

/**
 *
 * @param {NS} ns
 */
export async function main(ns) {
  let augments = loadAllAugments(ns);

  let augmentList = Object.keys(augments).map( augmentName => augments[augmentName])
  augmentList = augmentList.map( augment => {
    let newAugment = augment;
    for(let val of hacking_stats) {
      if(augment.stats[val]){
        newAugment.hackingAugment = true;
      }
    }

    for(let val of faction_stats) {
      if(augment.stats[val]){
        newAugment.factionAugment = true;
      }
    }
    return newAugment;
  });

  // We don't filter for purchased here since it's expensive, and we only plan to run this on our first cycle
  let targetAugments = augmentList.filter( augment => augment.hackingAugment ||
    augment.factionAugment ||
    augment.name === "Neuroreceptor Management Implant" ||
    augment.name === 'CashRoot Starter Kit' ||
    augment.name === 'The Red Pill');
  targetAugments = targetAugments.sort( (a, b) => a.price - b.price )
  targetAugments = targetAugments.splice(0, 5);

  let augmentNames = targetAugments.map( augment => augment.name)

  let resetConfig = {
    cycleStartTime: Date.now(),
    augmentsByPrice: augmentNames,
  }

  ns.tprint(JSON.stringify(resetConfig, null, 2))
  await ns.write('/temp/cycle-config.txt', JSON.stringify(resetConfig, null, 2), 'w');
}