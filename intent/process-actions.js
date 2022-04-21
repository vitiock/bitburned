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
  'NiteSec'
]

let workPid;

/**
 *
 * @param {NS} ns
 */
export async function main(ns) {
  if(workPid === undefined) {
    workPid = 0;
    ns.toast("Initing workpid");
  }

  let cycleState = loadCycleState(ns);

  if(!ns.isRunning(workPid, 'home')) {
    let softResetActions = cycleState.actions.filter(action => action.action === 'SOFT_RESET')
    if(softResetActions.length > 0){
      ns.toast("Soft resetting")
      //ns.softReset('bootstrap.js')
    }

    let working = false;
    for (let i = 0; i < cycleState.actions.length; i++) {
      let action = cycleState.actions[i];
      if (!working && action.action === 'UNLOCK' && cycleState.cycleDuration < 60*60*1000) {
        if (action.target === 'Tian Di Hui' && ns.getPlayer().city !== 'Chongqing') {
          ns.tprint('We should fly to Chongqing');
        }
        if (action.target === 'Tetrads') {
          if(ns.getPlayer().city !== 'Chongqing') {
            ns.tprint('We should fly to Chongqing');
            ns.travelToCity('Chongqing');
          }
          ns.toast("Commiting crime for the next 15 minutes", 'info', 60*5*1000);
          workPid = ns.exec('/crime.js', 'home', 1, '--duration', 60*5*1000);
          ns.tail('crime.js', 'home', '--duration', 60*5*1000);
          working = true;
        }
        if(MEGACORPS.includes(action.target)){
          ns.toast("Working for " + action.target + " to unlock faction");
          workPid = ns.exec('/debug/work.js', 'home', 1, '--company', action.target);
          working = true;
        }

        if(HACKING_FACTIONS.includes(action.target) && ns.getPlayer().hacking < 100 && ns.getPlayer().money > 1e6) {
          ns.tprint("We should study");
          workPid = ns.exec('/intent/study.js', 'home', 1);
        }

        if (action.target ==='Chongqing' && ns.getPlayer().city !== 'Chongqing') {
          ns.travelToCity('Chongqing');
        }
      }
    }

    if(!working) {
      let repActions = cycleState.actions.filter(action => action.action === 'REP')
      repActions = repActions.sort((a, b) => a.value - b.value)
      if (repActions.length > 0) {
        ns.tprint("We should do work for " + repActions[0].target)
        workPid = ns.exec('management/work-for-faction.js', 'home', 1, '--duration', 60*5*1000, '--targetFaction', repActions[0].target);
        working = true;
      }
    }

    if(!working) {
      let purchaseActions = cycleState.actions.filter(action => action.action === 'PURCHASE')
      if(purchaseActions.length > 0) {
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
      ns.installAugmentations('bootstrap.js')
    }

    if(!working) {
     // workPid = ns.exec('/crime.js', 'home', 1, '--duration', 60*1000);
      //ns.tail('crime.js', 'home', '--duration', 60*1000);
      //working = true;
    }
  }
}