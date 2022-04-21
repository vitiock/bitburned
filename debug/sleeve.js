/** @param {NS} ns **/
export async function main(ns) {
  let sleeve = ns.sleeve.getSleeveStats(0)
  while(sleeve.sync < 100){
    await ns.sleep(1000);
    ns.print("Current sync rate:" + sleeve.sync);
    sleeve = ns.sleeve.getSleeveStats(0);
  }
  ns.sleeve.setToCommitCrime(0, "mug");
}