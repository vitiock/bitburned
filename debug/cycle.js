function getFactionForAugment(augmentDetails){
  return augmentDetails.factions[0];
}

const GROW_STATE = 'GROW';
const MONEY_STATE = 'MONEY';
const REP_STATE = 'REP';
const FINALIZE_STATE = 'FINALIZE';

const ACTION_UNLOCK = 'UNLOCK';
const ACTION_REP = "REP";
const ACTION_MONEY = "MONEY";
const ACTION_PURCHASE = "PURCHASE";
const ACTION_SOFT_RESET = "SOFT_RESET";

const MEGA_CORPS = [
  'NWO',
  'Bachman & Associates',
  'Clarke Incorporated',
  'KuaiGong International'
]

const argsSchema = [
  ['noisy', true],
]


function getFactionCountsForAugmentsExcluding(augmentData, currentFactions){
  console.log(augmentData);
  let factions = {};
  for(let i = 0; i < augmentData.length; i++){
    let covered = false;
    for(let x = 0; x < currentFactions.length; x++){
      if(augmentData[i].factions && augmentData[i].factions.includes(currentFactions[x])){
        covered = true;
        break;
      }
    }

    if(!covered) {
      for (let x = 0; augmentData[i].factions && x < augmentData[i].factions.length; x++) {
        if (!factions[augmentData[i].factions[x]]) {
          factions[augmentData[i].factions[x]] = 0;
        }
        factions[augmentData[i].factions[x]]++;
      }
    }
  }

  return factions;
}

/**
 *
 * @param {AugmentDetails[]}augmentData
 */
function findSmallestSetOfFactionsInAugments(ns, augmentData){
  console.log("Find smallest");
  let excludeMegacorps = true;
  if(ns.getPlayer().company_rep_mult > 2.5){
    excludeMegacorps = false;
  }
  let currentFactions = [];
  let factionCounts = getFactionCountsForAugmentsExcluding(augmentData, currentFactions)
  while(Object.keys(factionCounts).length > 0){
    let includesNonMegacorps = false;
    for(let i = 0; i < Object.keys(factionCounts).length; i++){
      if(!MEGA_CORPS.includes(Object.keys(factionCounts)[i])){
        includesNonMegacorps = true;
      }
    }

    if(!includesNonMegacorps){
      //ns.tprint("Only mega corps remain");
      break;
    }

    let highest = 0;
    let highestFaction = ''
    for(let i = 0; i < Object.keys(factionCounts).length; i++){
     if(factionCounts[Object.keys(factionCounts)[i]] > highest && (!MEGA_CORPS.includes(Object.keys(factionCounts)[i]) || !excludeMegacorps)){
       highest = factionCounts[Object.keys(factionCounts)[i]];
       highestFaction = Object.keys(factionCounts)[i]
     }
    }
    currentFactions.push(highestFaction);
    factionCounts = getFactionCountsForAugmentsExcluding(augmentData, currentFactions)
  }
  return currentFactions;
}

/**
 *
 * @param {NS} ns
 * @param {string} augmentName
 * @param augmentData
 * @returns {Promise<AugmentDetails>}
 */
async function getDetailsForAugment(ns, augmentName, augmentData) {
  if(!augmentName){
    throw("No augment specified");
  }
  log.info(ns, "Loading augment data for: " + augmentName);
  if (!ns.fileExists('/temp/augment-' + augmentName.replaceAll(' ', '_') + '.txt')) {
    let pid = ns.exec('/data/augment-dynamic-data.js', 'home', 1, augmentName);
    while (ns.isRunning(pid, 'home')) {
      await ns.sleep(10);
    }
  }

  let augmentDynamicData
  try {
    augmentDynamicData = JSON.parse(await ns.read('/temp/augment-' + augmentName.replaceAll(' ', '_').replaceAll('(', '_').replaceAll(')','_').replaceAll('\'','_') + '.txt'));
  } catch (e) {
    throw("Failed to deserialize augment dynamic data for get details for augment");
  }

  let augmentDetails = augmentData[augmentName];
  if(! augmentDetails) {
    log.info(ns, "No augment data available for: " + augmentName);
    augmentDetails = {};
  }
  try {
    augmentDetails.repRequired = augmentDynamicData.rep;
    augmentDetails.price = augmentDynamicData.price;
  } catch (e) {
    ns.toast("Error getting augment details: " + e.toString(), 'error')
  }

  //ns.tprint(JSON.stringify(augmentDetails));
  return augmentDetails;
}

let log = {
  level: 0,
  info: (ns, value) => {
    if(log.level >= 3) {
      ns.tprint("INFO: " + value);
    }
  },
  error: (ns, value) => {
    ns.tprint("ERROR: " + value);
  }
}


function getPhase(cycleConfig, actions) {
  let duration = Math.floor(Date.now()-cycleConfig.cycleStartTime)

  if(duration > 120 * 60 * 1000) {
    return FINALIZE_STATE;
  }

  if( duration > 90 * 60 * 1000) {
    return MONEY_STATE;
  }

  let factionActions = actions.filter( action => action.action === 'UNLOCK')
  if(factionActions.length > 0){
    return GROW_STATE;
  }

  let repActions = actions.filter( action => action.action === 'REP' )
  if(repActions.length > 0){
    return REP_STATE
  }

  let moneyActions = actions.filter( action => action.action === 'MONEY')
  if(moneyActions.length > 0){
    return MONEY_STATE
  }

  return FINALIZE_STATE;
}

function getFactionsToUnlock(cycleConfig, augmentData) {

}

/** @param {NS} ns **/
export async function main(ns) {
  log.info(ns, "Starting cycle state creation")
  let flags = ns.flags(argsSchema);
  if(flags['noisy']){
    log.level = 0;
  }

  let cycleConfig
  if(ns.fileExists('/temp/cycle-config.txt')){
    cycleConfig = JSON.parse(ns.read('/temp/cycle-config.txt'));
    log.info(ns, "Loading in cycle config");
  } else {
    throw("Cycle config does not exist");
  }

  if(!ns.fileExists('/static-data/augments.txt')){
    log.error("Augments file doesn't exist");
    throw("Augments static data file doesn't exist");
  }

  log.info(ns, "Loading in static augment data");
  let augmentData = JSON.parse(ns.read('/static-data/augments.txt'));

  let cycleState = {};
  cycleState.cycleDuration = Math.floor(Date.now()-cycleConfig.cycleStartTime)


  let targetAugment;
  if(cycleConfig.buyNeuroFluxFirst || !cycleConfig.targetAugment) {
    targetAugment = 'NeuroFlux Governor';
  } else {
    targetAugment = cycleConfig.augmentsByPrice[4];
  }

  if(targetAugment && !ns.fileExists('/temp/augment-' + targetAugment.replaceAll(' ', '_').replaceAll('(', '_').replaceAll(')','_').replaceAll('\'','_')+ '.txt')){
    ns.exec('/data/augment-dynamic-data.js', 'home', 1, targetAugment);
    await ns.sleep(100);
  }

  let augmentDynamicData
  if(targetAugment && ns.fileExists('/temp/augment-' + targetAugment.replaceAll(' ', '_').replaceAll('(', '_').replaceAll(')','_').replaceAll('\'','_')+ '.txt')) {
    try {
      augmentDynamicData = JSON.parse(ns.read('/temp/augment-' + targetAugment.replaceAll(' ', '_').replaceAll('(', '_').replaceAll(')', '_').replaceAll('\'','_') + '.txt'));
    } catch (e) {
      throw("Failed to deserialize augment dynamic data");
    }
  } else {
    augmentDynamicData = {
      rep: 0,
      price: 0
    }
  }

  cycleState.targetAugment = targetAugment;
  if(augmentData[targetAugment]) {
    cycleState.targetAugmentDetails = augmentData[targetAugment];
  } else {
    cycleState.targetAugmentDetails = {factions: ['Daedalus']};
  }
  cycleState.targetAugmentDetails.repRequired = augmentDynamicData.rep;
  cycleState.targetAugmentDetails.price = augmentDynamicData.price;
  let targetFaction = getFactionForAugment(cycleState.targetAugmentDetails);
  cycleState.targetFaction = targetFaction;
  let factionDetails = {}
  factionDetails.inFaction = ns.getPlayer().factions.includes(targetFaction);
  factionDetails.currentFactionRep = Math.floor(ns.getFactionRep(targetFaction));
  factionDetails.currentFactionFavor = Math.floor(ns.getFactionFavor(targetFaction));
  cycleState.factionDetails = factionDetails;

  let nextAction = 'Work4Faction';
  let nextActionDetails = {};

  let allAugments = [];
  for(let i = 0; i < cycleConfig.augmentsByPrice.length; i++){
    allAugments.push(await getDetailsForAugment(ns, cycleConfig.augmentsByPrice[i], augmentData));
  }
  log.info(ns, "Total augments for this cycle: " + allAugments.length);

  /*
  let factionsToTarget = [];
  for(let i = 0; i < allAugments.length; i++){
    for(let x = 0; allAugments[i].factions && x < allAugments[i].factions.length; x++){
      if(!factionsToTarget.includes(allAugments[i].factions[x])){
        factionsToTarget.push(allAugments[i].factions[x])
      }
    }
  }
   */
  let factionsToTarget = findSmallestSetOfFactionsInAugments(ns, allAugments);

  log.info(ns, "Total factions to target: " + factionsToTarget.length);

  let cycleFactions = [];
  for(let i = 0; i < factionsToTarget.length; i++){
    let factionDetails = {}
    log.info(ns, "Loading faction details for faction: " + factionsToTarget[i])
    factionDetails.name = factionsToTarget[i];
    factionDetails.inFaction = ns.getPlayer().factions.includes(factionsToTarget[i]);
    factionDetails.currentFactionRep = Math.floor(ns.getFactionRep(factionsToTarget[i]));
    factionDetails.currentFactionFavor = Math.floor(ns.getFactionFavor(factionsToTarget[i]));
    factionDetails.currentFavorGain = Math.floor(ns.getFactionFavorGain(factionsToTarget[i]));
    cycleFactions.push(factionDetails);
  }


  let actions = [];
  //Grind for int here
  /*
  if(ns.getPlayer().factions.length > 5){
    actions.push({
      action: ACTION_SOFT_RESET,
      target: '',
      value: 0,
    })
  }
   */

  if(ns.getPlayer().factions.includes('Daedalus') && !ns.getOwnedAugmentations(true).includes('The Red Pill') && ns.getFactionFavor('Daedalus') < 150){
    if(ns.getFactionFavorGain('Daedalus') < 10) {
      actions.push({
        action: ACTION_REP,
        target: 'Daedalus',
        value: 1000000
      })
    }
  }

    for (let i = 0; i < cycleFactions.length; i++) {
      if (!cycleFactions[i].inFaction) {
        log.info(ns, "Not in faction: " + cycleFactions[i].name)
        actions.push({
          action: ACTION_UNLOCK,
          target: cycleFactions[i].name,
        })
      }
    }

    for (let i = 0; i < cycleFactions.length; i++) {
      let requiredRep = 0;
      if (cycleFactions[i].inFaction) {
        for (let x = 0; x < allAugments.length; x++) {
          if (allAugments[x].factions && allAugments[x].factions.includes(cycleFactions[i].name) && allAugments[x].repRequired > requiredRep) {
            requiredRep = allAugments[x].repRequired;
          }
        }

        log.info(ns, "Need " + requiredRep + " rep with " + cycleFactions[i].name + " already have " + cycleFactions[i].currentFactionRep);
      }
      if (requiredRep > 0) {
        let offsetRep = requiredRep - cycleFactions[i].currentFactionRep;
        if (offsetRep > 0) {
            actions.push({
              action: ACTION_REP,
              target: cycleFactions[i].name,
              value: requiredRep - cycleFactions[i].currentFactionRep
            })
        }
      }
    }

  let moneys = 0;
  for(let i = 0; i < allAugments.length; i++){
    moneys += allAugments[i].price;
  }

  if(moneys >= ns.getPlayer().money) {
    actions.push({
      action: ACTION_MONEY,
      value: Math.floor(moneys - ns.getPlayer().money)
    })
  } else {
    //check for donations here
  }

  if(actions.length === 0 || cycleState.cycleDuration > 120 * 60 * 1000){
    let nextAugment = allAugments.filter( aug => {
      if(ns.getOwnedAugmentations(true).includes(aug.name)){
        return false;
      }
      return true;
    });

    let addedPurchase = false;
    if(nextAugment.length > 0) {
      nextAugment = nextAugment.sort((a, b) => b.price - a.price);
      for(let i = 0; i < nextAugment.length; i++) {
        for (let x = 0; x < nextAugment[i].factions.length; x++) {
          for (let y = 0; y < cycleFactions.length; y++) {
            if(nextAugment[i].price < ns.getPlayer().money) {
              if (cycleFactions[y].name === nextAugment[i].factions[x]) {
                if (cycleFactions[y].currentFactionRep > nextAugment[i].repRequired) {
                  addedPurchase = true;
                  actions.push({
                    action: ACTION_PURCHASE,
                    target: nextAugment[i].name,
                  })
                }
              }
            }
          }
        }
      }
    }

    if(!addedPurchase){
      let neuroFluxDetails = await getDetailsForAugment(ns, "NeuroFlux Governor", augmentData)
      if(neuroFluxDetails.price < ns.getPlayer().money && ns.getOwnedAugmentations(true) - ns.getOwnedAugmentations(false) > 1) {
        for(let i = 0; i < ns.getPlayer().factions.length; i++) {
          if(ns.getFactionRep(ns.getPlayer().factions[i]) > neuroFluxDetails.repRequired) {
            ns.toast("Can purchase neuroflux from: " + ns.getPlayer().factions[i]);
            actions.push({
              action: ACTION_PURCHASE,
              target: "NeuroFlux Governor",
            });
            break;
          }
        }
      }
    }
  }

  cycleState.currentPhase = getPhase(cycleConfig, actions);
  log.info(ns, "Current phase: " + cycleState.currentPhase);

  if(factionDetails.inFaction){
    if(cycleState.targetAugmentDetails.repRequired > cycleState.factionDetails.currentFactionRep) {
      nextAction = "Work4Faction";
      nextActionDetails.target = cycleState.targetFaction;

    } else if(cycleState.targetAugmentDetails.price > ns.getPlayer().money){
      nextAction = "Crime"
    } else {
      nextAction = "Purchase Augment";
    }
  } else {
    nextAction = "Crime"
  }

  cycleState.cycleAugments = allAugments;
  cycleState.cycleFactions = cycleFactions;
  cycleState.nextAction = nextAction;
  cycleState.nextActionDetails = nextActionDetails;
  cycleState.actions = actions

  //ns.tprint(JSON.stringify(cycleState, null, 2));
  await ns.write('/temp/cycle-state.txt', JSON.stringify(cycleState, null, 2), 'w')
}