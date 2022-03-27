/** @param {NS} ns **/
export async function main(ns) {
  if (ns.getPlayer().money > ns.getUpgradeHomeRamCost()) {
    if (ns.upgradeHomeRam()) {
      ns.toast("Upgrade home computer RAM!", 'success', null);
    }
  }
}