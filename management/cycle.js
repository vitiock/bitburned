/**
 *
 * @param {NS} ns
 */
export async function main(ns) {
  let cycleConfig
  if(ns.fileExists('/temp/cycle-config.txt')){
    cycleConfig = JSON.parse(ns.read('/temp/cycle-config.txt'));
  } else {
    ns.tprint("Config not created, exiting");
    return
  }

  let purchaseAugment = cycleConfig.targetAugment

  let targetedAugmentPurchased = false;
  let neuroPurchased = false;

  if(cycleConfig.buyNeuroFluxFirst) {
    purchaseAugment = 'NeuroFlux Governor';
  }

  while(!neuroPurchased || !targetedAugmentPurchased) {
    if(ns.purchaseAugmentation(cycleConfig.targetFaction, purchaseAugment)) {
      ns.toast("Purchased augment: " + purchaseAugment, 'info', null);
      if(purchaseAugment === 'NeuroFlux Governor') {
        neuroPurchased = true;
        purchaseAugment = cycleConfig.targetAugment;
      } else {
        targetedAugmentPurchased = true;
        purchaseAugment = 'NeuroFlux Governor'
      }
    } else {
      await ns.sleep(60000);
    }
  }

  //ns.installAugmentations('/bootstrap.sh');
}