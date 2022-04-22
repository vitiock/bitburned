/** @param {NS} ns **/
export async function main(ns) {
  let sleeve = ns.sleeve.getSleeveStats(0)
  while(sleeve.sync < 100){
    if(ns.sleeve.getTask(0).task != 'Synchro') {
      ns.tprint(ns.sleeve.getTask(0).task)
      ns.sleeve.setToSynchronize(0);
    }
    sleeve = ns.sleeve.getSleeveStats(0);
    await ns.sleep(1000);
    ns.print("Current sync rate:" + sleeve.sync);
  }
  ns.sleeve.setToCommitCrime(0, "mug");
}