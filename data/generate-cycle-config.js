/** @param {NS} ns **/
import {executeAndWait} from "/helpers";

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
  'Daedalus',
  'ECorp'
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
  'faction_rep_mult'
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

function isHacking(augment){
  for(let i = 0; i < hacking_stats.length; i++){
    if(augment.stats[hacking_stats[i]] > 0){
      return true;
    }
  }
  return false;
}

function isFaction(ns, augment){
  for(let i = 0; i < faction_stats.length; i++){
    if(augment.stats[faction_stats[i]] > 0){
      ns.tprint("Found faction aug: " + augment.name);
      return true;
    }
  }
  return false;
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

  await executeAndWait(ns, '/data/generate-purchased-augments.js', 'home');
  let purchasedAugments = JSON.parse(ns.read('/temp/purchased-augments.txt'))

  let ownedAugments = purchasedAugments.length;

  let targetAugments = augmentList.filter( augment => !purchasedAugments.includes(augment.name));

  targetAugments = targetAugments.filter( augment => {
    if(isHacking(augment) ||
        isFaction(ns, augment) ||
        augment.name === "Neuroreceptor Management Implant" ||
        augment.name === 'CashRoot Starter Kit') {
      return true;
    }
    if(ownedAugments > 30 && augment.name === 'The Red Pill') {
      return true;
    }
    return false;
  });

  targetAugments = targetAugments.map( augment => {
    // TODO: load this from files
    let price = Math.ceil(ns.getAugmentationPrice(augment.name));
    let rep = Math.ceil(ns.getAugmentationRepReq(augment.name));
    augment.rep = rep;
    augment.price = price;
    return augment
  })

  await ns.write("/temp/possibleAugs.txt", JSON.stringify(targetAugments, null, 2), 'w');



  targetAugments = targetAugments.sort( (a, b) => a.price - b.price )

  let cycleAugments = [];
  for(let i = 0; i < targetAugments.length; i++){
    if(!augmentList.includes(targetAugments[i].name)){
      cycleAugments.push(targetAugments[i].name)
    }
    if(cycleAugments.length === 6){
      break;
    }
  }

  ns.tprint(JSON.stringify(cycleAugments))
  let resetConfig = {
    cycleStartTime: Date.now(),
    augmentsByPrice: cycleAugments,
  }
  ns.tprint(JSON.stringify(resetConfig, null, 2))
  await ns.write('/temp/cycle-config.txt', JSON.stringify(resetConfig, null, 2), 'w');
}