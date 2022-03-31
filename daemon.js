/** @param {NS} ns **/

export async function main(ns) {
  let scriptsToExecute = ['management/find-targets.js', 'management/server.js', 'management/hacknet.js', 'home-computer.js', 'do-backdoor.js', "/debug/contracts.js", "hud.js"];

  while(true) {
    for(let i = 0; i < scriptsToExecute.length; i++){
      let pid = ns.exec(scriptsToExecute[i], 'home', 1, "");
      if( pid === 0){
        ns.toast("Failed to start " + scriptsToExecute[i], 'error', null);
      } else {
        while (ns.isRunning(pid)) {
          await ns.sleep(100);
        }
      }
    }
  }

  ns.get
}