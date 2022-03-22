/** @param {NS} ns **/

export async function main(ns) {
  let scriptsToExecute = ['management/hyper-v.js', 'management/find-targets.js', 'management/server.js', 'management/hacknet.js'];

  while(true) {
    for(let i = 0; i < scriptsToExecute.length; i++){
      let pid = ns.exec(scriptsToExecute[i], 'home', 1, "");
      while(ns.isRunning(pid)){
        await ns.sleep(1000)
      }
    }
  }
}