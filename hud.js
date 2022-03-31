import {formatMoney} from "./helpers";

/** @param {NS} ns **/
let doc = eval("document");

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
      let cycleConfig = JSON.parse(ns.read("/temp/cycle-config.txt"))
      ns.exec('/data/augment-dynamic-data.js', 'home', 1, cycleConfig.targetAugment);
      ns.print("Read file: " + "/temp/augment-"+cycleConfig.targetAugment.replace(" ", "_")+".txt")
      let augmentData = JSON.parse(ns.read("/temp/augment-"+cycleConfig.targetAugment.replaceAll(" ", "_")+".txt"))
      headers.push("Aug");
      values.push(cycleConfig.targetAugment);
      headers.push("Fac");
      values.push(cycleConfig.targetFaction);
      headers.push("Rep");
      values.push(Math.floor(augmentData.rep-ns.getFactionRep(cycleConfig.targetFaction)));
      headers.push("Money");
      values.push(formatMoney(Math.ceil(augmentData.price - ns.getPlayer().money), 0));

      // Now drop it into the placeholder elements
      hook0.innerText = headers.join(" \n");
      hook1.innerText = values.join("\n");
    } catch (err) { // This might come in handy later
      ns.toast("ERROR: Update Skipped: " + String(err), 'error');
    }
}