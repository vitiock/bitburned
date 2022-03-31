/** @param {NS} ns **/

export async function main(ns) {
  ns.tprint("Bitnode Information")
  let multipliers = ns.getBitNodeMultipliers()
  ns.tprint(JSON.stringify(multipliers, null, 2));
}