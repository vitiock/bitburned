import {formatMoney, getServers, loadCycleState} from "./helpers";

/** @param {NS} ns **/
let doc = eval("document");

function msToHMS( ms ) {
  // 1- Convert to seconds:
  let seconds = ms / 1000;
  // 2- Extract hours:
  const hours = parseInt( seconds / 3600 ); // 3,600 seconds in 1 hour
  seconds = seconds % 3600; // seconds remaining after extracting hours
  // 3- Extract minutes:
  const minutes = parseInt( seconds / 60 ); // 60 seconds in 1 minute
  // 4- Keep only seconds not extracted to minutes:
  seconds = Math.floor(seconds % 60);
  return hours+":"+minutes+":"+seconds;
}

/**
 *
 * @param {NS} ns
 */
export async function main(ns) {
  const hook0 = doc.getElementById('overview-extra-hook-0');
  const hook1 = doc.getElementById('overview-extra-hook-1');
    try {
      const headers = []
      const values = [];
      let cycleState = loadCycleState(ns);
      if(cycleState.targetFaction) {
        headers.push("Fac");
        values.push(cycleState.targetFaction);
      }
      if(ns.getPlayer().isWorking){
        headers.push("Work");
        values.push(ns.getPlayer().workType);
        if(ns.getPlayer().workType !== 'Committing a crime') {
          headers.push("Rep Gain");
          values.push(ns.getPlayer().workRepGainRate * 5);
        }
      }
      if(cycleState.nextAction) {
        headers.push("Next Action");
        values.push(cycleState.nextAction);
      }
      headers.push("Duration");
      values.push(msToHMS(cycleState.cycleDuration));

      let servers = getServers(ns);
      servers = servers.filter( server => server.hasAdminRights)


      // Now drop it into the placeholder elements
      hook0.innerText = headers.join(" \n");
      hook1.innerText = values.join("\n");
    } catch (err) { // This might come in handy later
      ns.toast("ERROR: Update Skipped: " + String(err), 'error');
    }
}