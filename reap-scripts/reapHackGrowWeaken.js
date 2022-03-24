const argsSchema = [
  ['target', 'n00dles'],
  ['hackthreads', 1],
  ['hackweakenthreads', 1],
  ['hackgrowthreads', 1],
  ['growthhackthreads', 1],
  ['growthweakenthreads', 1]
]

export function autocomplete(data, args) {
  data.flags(argsSchema);
  return [];
}

/** @param {NS} ns **/
export async function main(ns) {
  const flags = ns.flags(argsSchema);
  ns.tprint(JSON.stringify(flags));
  await ns.weaken(flags['target'])

  let reapConfig = {
    hackThreads: flags['hackthreads'],
    hackWeakenThreads: flags['hackweakenthreads'],
    growThreads: flags['growthhackthreads'],
    growWeakenThreads: flags['growthweakenthreads'],
  }
  ns.tprint(JSON.stringify(reapConfig));
  await ns.write('/reap/reap-'+flags['target']+'-5.txt', JSON.stringify(reapConfig), 'w');
  ns.rm('reap-lock-'+flags['target']+'.txt');
}