const argsSchema = [
  ['target', 'n00dles'],
  ['hackthreads', 1],
  ['hackweakenthreads', 1],
  ['hackgrowthreads', 1],
  ['growthhackthreads', 1]
]

export function autocomplete(data, args) {
  data.flags(argsSchema);
  return [];
}

/** @param {NS} ns **/
export async function main(ns) {
  const flags = ns.flags(argsSchema);
  ns.tprint(JSON.stringify(flags));
  await ns.grow(flags['target'])

  let server = ns.getServer(flags['target'])
  let weakenThreads = 1;
  while(ns.weakenAnalyze(weakenThreads, 1) < server.hackDifficulty - server.minDifficulty) {
    weakenThreads += 1;
  }
  ns.exec('/reap-scripts/reapHackGrowWeaken.js', 'home', weakenThreads, '--target', flags['target'], '--hackthreads', flags['hackthreads'], '--hackweakenthreads', flags['hackweakenthreads'], '--growthhackthreads', flags['growthhackthreads'], '--growthweakenthreads', weakenThreads)
}