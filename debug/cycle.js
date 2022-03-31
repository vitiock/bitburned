function getFactionForAugment(augmentDetails){
  return augmentDetails.factions[0];
}

/** @param {NS} ns **/
export async function main(ns) {
  ns.tprint("Attempting to figure out cycle state");
  let cycleConfig
  if(ns.fileExists('/temp/cycle-config.txt')){
    cycleConfig = JSON.parse(ns.read('/temp/cycle-config.txt'));
  } else {
    throw("Cycle config does not exist");
  }

  if(!ns.fileExists('/static-data/augments.txt')){
    throw("Augments static data file doesn't exist");
  }

  let augmentData = JSON.parse(ns.read('/static-data/augments.txt'));

  let cycleState = {};
  let targetAugment;
  if(cycleConfig.buyNeuroFluxFirst) {
    targetAugment = 'NeuroFlux Governor';
  } else {
    targetAugment = cycleConfig.targetAugment;
  }

  if(ns.fileExists('/temp/augment-' + targetAugment.replaceAll(' ', '_') + '.txt')){
    ns.tprint("Temp augment data exists");
  } else {
    ns.tprint("Generating data for augment: " + targetAugment);
  }

  let augmentDynamicData = JSON.parse(ns.read('/temp/augment-'+targetAugment.replaceAll(' ', '_')+'.txt'));

  cycleState.targetAugment = targetAugment;
  cycleState.targetAugmentDetails = augmentData[targetAugment];
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

  if(factionDetails.inFaction){
    ns.tprint("In faction already don't have to worry about unlock");

    if(cycleState.targetAugmentDetails.repRequired > cycleState.factionDetails.currentFactionRep) {
      ns.tprint("We require rep, do faction work");
      nextAction = "Work4Faction";
      nextActionDetails.target = cycleState.targetFaction;
    } else if(cycleState.targetAugmentDetails.price > ns.getPlayer().money){
      ns.tprint("Need to farm money, commiting crimes")
      nextAction = "Crime"
    } else {
      ns.tprint("Have required money to purchase augment")
      nextAction = "Purchase Augment";
    }
  } else {
    ns.tprint("Not in faction commiting crime to unlock")
    nextAction = "Crime"
  }

  cycleState.nextAction = nextAction;
  cycleState.nextActionDetails = nextActionDetails;

  ns.tprint(JSON.stringify(cycleState, null, 2));
  await ns.write('/temp/cycle-state.txt', JSON.stringify(cycleState, null, 2), 'w')
}