/**
 *
 * @param {NS} ns
 * @param {string} augmentName
 */
async function getAugmentData(ns, augmentName) {
  let data = {
    name: augmentName,
    //faction: faction,
    price: Math.ceil(ns.getAugmentationPrice(augmentName)),
    //price: 1000000,
    rep: Math.ceil(ns.getAugmentationRepReq(augmentName)),
    //rep: 1000000,
    stats: ns.getAugmentationStats(augmentName)
  }
  return data;
}

/**
 *
 * @param {NS} ns
 */
export async function main(ns) {
  let augments = ns.args;
  ns.print(JSON.stringify(augments));
  for(let augment of augments) {
    ns.print("Getting data for " + augment);
    let data
    try {
      data = await getAugmentData(ns, augment);
    } catch (e) {
      data = {
        name: augmentName,
        price: 1000000,
        rep: 1000000,
        stats: ns.getAugmentationStats(augmentName)
      }
    }
    let augmentFilename = augment.replaceAll(" ", "_") .replaceAll('(', '_').replaceAll(')','_').replaceAll('\'','_');
    await ns.write('/temp/augment-' + augmentFilename + ".txt", JSON.stringify(data, null, 2), "w");
  }
}