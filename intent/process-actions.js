import {executeAndWait, loadCycleState} from "/helpers";

const argsSchema = [
  ['noisy', true],
]

const MEGACORPS = [
  'Bachman & Associates',
  'Clarke Incorporated',
  'Fulcrum Secret Technologies',
  'NWO',
  'KuaiGong International'
]

const HACKING_FACTIONS = [
  'cybersec',
  'NiteSec',
  'Blackhand'
]

const COMBAT_FACTIONS = [
  'Tetrads'
]

const FACTION_ORDER = [
  'NiteSec',
  'Tetrads',
  'Netburners'
]

let workPid;
let crimeStartedAt;

/**
 *
 * @param {NS} ns
 */
function doStudy(ns, focus = false) {
  let pid = ns.exec('/intent/study.js', 'home', 1, '--focus', focus);
  if(pid === 0){
    ns.tprint("failed to start study");
    let processes = ns.ps('home');
    for(let process of processes){
      if(process.filename === '/intent/study.js'){
        workPid = process.pid;
        return;
      }
    }
  } else {
    workPid = pid;
  }
}

function doCombat(ns) {
  let pid = ns.exec('/crime.js', 'home', 1, '--duration', 60*5*1000);
  if(pid === 0){
    let processes = ns.ps('home');
    for(let process of processes){
      if(process.filename === '/crime.js'){
        workPid = process.pid;
        return;
      }
    }
  } else {
    workPid = pid;
  }
}

function handleUnlockActions(ns){
  if(workPid !== 0){
    return false;
  }

  let actions = loadCycleState(ns).actions.filter( action => action.action === 'UNLOCK');
  let factionsToUnlock = actions.map( action => action.target);

  if(factionsToUnlock.length === 0){
    return false;
  }

  let factionToUnlock;
  for(let faction of FACTION_ORDER){
    if(factionsToUnlock.includes(faction)){
      ns.tprint("We should unlock: " + faction);
      factionToUnlock = faction;
      break;
    }
  }

  if(factionToUnlock === undefined){
    ns.tprint("Failed to find in our ordering: " + JSON.stringify(factionsToUnlock));
  }

  if(HACKING_FACTIONS.includes(factionToUnlock) && workPid === 0){
    if(ns.getPlayer().hacking < 100) {
      ns.tprint("Hacking faction we should study");
      doStudy(ns);
      return true;
    } else {
      ns.tprint("Hacking faction probably need more money for hacking servers")
      doCombat(ns);
      return true;
    }
  }

  if(COMBAT_FACTIONS.includes(factionToUnlock) && workPid === 0){
    ns.tprint("We should crime to build stats");
    doCombat(ns);
    return true;
  }

  if(MEGACORPS.includes(action.target)){
    ns.toast("Working for " + action.target + " to unlock faction");
    workPid = ns.exec('/debug/work.js', 'home', 1, '--company', action.target);
    return true;
  }

  return false;
}

function handleSoftResetActions(ns){
  if(workPid !== 0){
    return false;
  }
  let cycleState = loadCycleState(ns);
  let softResetActions = cycleState.actions.filter(action => action.action === 'SOFT_RESET')
  if(softResetActions.length > 0){
    ns.toast("Soft resetting")
    //ns.softReset('bootstrap.js')
  }
  return false;
}

function handleRepActions(ns) {
  if(workPid !== 0){
    return false;
  }

  let cycleState = loadCycleState(ns);
  let repActions = cycleState.actions.filter(action => action.action === 'REP')

  let factions = repActions.map(action => action.target);
  for(let faction of FACTION_ORDER){
    if(factions.includes(faction)){
      workPid = ns.exec('management/work-for-faction.js', 'home', 1, '--duration', 60*5*1000, '--targetFaction', faction);
      return true;
    }
  }
  ns.tprint("ERROR: No order for " + JSON.stringify(factions))

  return false;
}

/**
 *
 * @param {NS} ns
 */
export async function main(ns) {
  return;
  if(workPid === undefined) {
    workPid = 0;
    crimeStartedAt = 0;
    ns.toast("Initing workpid");
  }

  let cycleState = loadCycleState(ns);
  if(workPid === 0 || !ns.isRunning(workPid, 'home')) {
    workPid = 0;

    ns.tprint("Current number of actions: " + cycleState.actions.length);
    let working = handleUnlockActions(ns);
    working &= handleSoftResetActions(ns)
    working &= handleRepActions(ns);

    if(!working) {
      let purchaseActions = cycleState.actions.filter(action => action.action === 'PURCHASE')
      if(purchaseActions.length === cycleState.actions.length) {
        working = true;
        let nextPurchaseAction = purchaseActions[0];
        await executeAndWait(ns, '/intent/purchase-augment.js', 'home', '--augmentToPurchase', nextPurchaseAction.target);
      }
    }

    if(!working && (cycleState.currentPhase === 'REP' || cycleState.currentPhase === 'GROW')) {
      //workPid = ns.exec('/crime.js', 'home', 1, '--duration', 60*1000);
      //ns.tail('crime.js', 'home', '--duration', 60*1000);
      //working = true;
    }

    if(!working && cycleState.cycleDuration > 60 * 120 * 1000 && cycleState.actions.length === 0) {
      //TODO: Replace this functionality with an explicit install action
      ns.tprint("Nothing left to do");
      //ns.installAugmentations('bootstrap.js')
    }

    if(!working && ns.getPlayer().hacking < 100 && ns.getPlayer().money > 1e6) {
      ns.tprint("We should study");
      workPid = ns.exec('/intent/study.js', 'home', 1);
      working = true;
    }

    if(!working && Date.now()-crimeStartedAt > 5*60000) {
      //workPid = ns.exec('/crime.js', 'home', 1, '--duration', 5*60*1000);
      working = true;
    }
  }

}