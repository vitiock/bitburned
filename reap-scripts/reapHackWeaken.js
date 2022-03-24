const argsSchema = [
  ['target', 'n00dles'],
  ['hackthreads', 1],
  ['hackweakenthreads', 1]
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

  let server = ns.getServer(flags['target'])

  let growthThreads = Math.ceil(ns.growthAnalyze(flags['target'], server.moneyMax/server.moneyAvailable));
  ns.tprint("Grow threads: " + growthThreads )
  ns.exec('/reap-scripts/reapHackGrow.js', 'home', growthThreads, '--target', flags['target'], '--hackthreads', flags['hackthreads'], '--hackweakenthreads', flags['hackweakenthreads'], '--growthhackthreads', growthThreads)
}