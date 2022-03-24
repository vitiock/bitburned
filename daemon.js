/** @param {NS} ns **/

export async function main(ns) {
  let scriptsToExecute = ['management/hyper-v.js', 'management/find-targets.js', 'management/server.js', 'management/hacknet.js'];

  ns.exec('clear-reap-config.js', 'home');

  let ticks = 0
  while(true) {
    ticks = ticks + 1 % 1000000000;
    for(let i = 0; i < scriptsToExecute.length; i++){
      let start = Date.now();
      let pid = ns.exec(scriptsToExecute[i], 'home', 1, "");
      while(ns.isRunning(pid)){
        let sleepTime = 1000 - (start-Date.now());
        if(sleepTime > 10) {
          await ns.sleep(sleepTime);
        } else {
          await ns.sleep(10);
        }
      }
    }
  }
}