const argsSchema = [
  ['augmentToPurchase', '']
]

/**
 *
 * @param {NS} ns
 */
export async function main(ns) {
  let flags = ns.flags(argsSchema);
  for(let faction of ns.getPlayer().factions){
    if(ns.purchaseAugmentation(faction, flags['augmentToPurchase'])){
      ns.toast("Purchased " + flags['augmentToPurchase'])
      for(let file of ns.ls('home', '/temp/augment')){
        ns.tprint("Deleting: " + file);
        ns.rm(file);
      }
      break;
    }
  }
}