/**
 *
 * @param {NS} ns
 */
export async function main(ns) {
  let augments = ns.getOwnedAugmentations(true);
  await ns.write('/temp/purchased-augments.txt', JSON.stringify(augments), 'w')
}