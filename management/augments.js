/** @param {NS} ns **/

export async function main(ns) {

  ns.tprint("Price: " + ns.getAugmentationPrice('NeuroFlux Governor'));
  ns.tprint("Rep: " + ns.getAugmentationRepReq('NeuroFlux Governor'))
}