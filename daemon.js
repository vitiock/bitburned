/** @param {NS} ns **/
import {executeAndWait, generateFactionData, loadCycleState} from "./helpers";

/**
 *
 * @param {NS}ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
  ns.disableLog('exec');
  ns.disableLog('sleep');

  ns.tail();

  let scriptsToExecute = [
    'intent/spend-hashes.js',
    'management/find-targets.js',
    'management/server.js',
    'management/hacknet.js',
    'home-computer.js',
    'do-backdoor.js',
    "/debug/contracts.js",
    "hud.js",
    "management/join-factions.js",
    'debug/gang.js',
    'management/stonks.js',
    'intent/process-actions.js',
    'debug/corp.js',
  ];
  let timedScriptsToExecute = [
    {
      script: 'management/purchase-reputation.js',
      period: 60000*5 // 5 minutes
    }
  ]
  let scriptPids = [];
  let timedScriptPids = [];
  let lastExecuted = [];
  while(true) {
    ns.print("---Daemon loop Start---------------------------------")
    let cycleState = loadCycleState(ns);
    ns.print("Executing general scripts");
    for(let i = 0; i < scriptsToExecute.length; i++){
      try {
        if (!scriptPids[i] || !ns.isRunning(scriptPids[i], 'home')) {
          let pid = ns.exec(scriptsToExecute[i], 'home', 1, "");
          if (pid === 0) {
            ns.print("Failed to start " + scriptsToExecute[i]);
          } else {
            scriptPids[i] = pid;
          }
        }
      } catch(e){
        ns.print(e.toString())
      }
      await ns.sleep(10)
    }

    ns.print("Executing time based scripts");
    for(let i = 0; i < timedScriptsToExecute.length; i++){
      if(!timedScriptPids[i] || !ns.isRunning(timedScriptPids[i], 'home')) {
        if(!lastExecuted[i] || lastExecuted[i] + timedScriptsToExecute[i].period < Date.now()) {
          ns.print("Executing: " + timedScriptsToExecute[i].script)
          let pid = ns.exec(timedScriptsToExecute[i].script, 'home');
          if (pid === 0) {
            ns.print("Failed to start " + timedScriptsToExecute[i]);
          } else {
            timedScriptPids[i] = pid;
            lastExecuted[i] = Date.now();
          }
        }
      }
    }


    /*
    try {
      ns.print("Generating faction data");
      await generateFactionData(ns, 'home');
    } catch (e) {
      ns.print(e.toString())
    }
    */


    try {
      ns.print("Generating Cycle Data");
      await executeAndWait(ns, '/debug/cycle.js', 'home');
    } catch (e) {
      ns.print(e.toString())
    }

    try {
      ns.print("Looking for factions to join");
      await executeAndWait(ns, '/management/join-factions.js', 'home');
    } catch (e) {
      ns.print(e.toString())
    }

    /*
    try {
      ns.print("Working on actions");
      await executeAndWait(ns, '/intent/process-actions.js', 'home');
    } catch (e) {
      ns.print(e.toString());
    }
     */


    await ns.sleep(100);
  }

}