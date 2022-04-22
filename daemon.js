/** @param {NS} ns **/
import {executeAndWait, generateFactionData, loadCycleState} from "./helpers";

let rate

/**
 *
 * @param {NS}ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
  ns.disableLog('exec');
  ns.disableLog('sleep');
  ns.tail();

  if(rate === undefined){
    rate = {};
  }

  //TODO: Move to generating this in bootstrap
  let executions = [
    {
      type: 'ALWAYS',
      script: 'intent/nuke-servers.js',
      rate: 60000,
      args: []
    }, {
      type: 'ALWAYS',
      script: 'management/purchase-reputation.js',
      rate: 60000 * 5,
      args: []
    }, {
      type: 'ALWAYS',
      script: 'intent/spend-hashes.js',
      rate: 60000 * 5,
      args: []
    }, {
      type: 'ALWAYS',
      script: 'management/process-events.js',
      rate: 1000,
      args: []
    },
  ]

  await ns.write('/temp/CRON.txt', JSON.stringify(executions, null, 2), 'w');

  let scriptsToExecute = [
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
    //'debug/corp.js',
  ];

  let scriptPids = [];
  let timedScriptPids = [];
  let lastExecuted = [];
  while(true) {
    let cron = JSON.parse(ns.read('/temp/CRON.txt'));
    //ns.tprint(JSON.stringify(cron, null, 2));

    ns.print("---Daemon loop Start---------------------------------")
    for(let i = 0; i < cron.length; i++){
      if(cron[i].type === 'ALWAYS' && (rate[cron[i].script] === undefined || Date.now()-rate[cron[i].script] > cron[i].rate)) {
        let pid = ns.exec(cron[i].script, 'home', 1, ...cron[i].args)
        if( pid !== 0 ) {
          rate[cron[i].script] = Date.now();
        }
      }
    }

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