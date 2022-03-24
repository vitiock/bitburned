const argsSchema = [
  ['target', 'n00dles'],
  ['hackthreads', 1]
]

export function autocomplete(data, args) {
  data.flags(argsSchema);
  return [];
}

/** @param {NS} ns **/
export async function main(ns) {
  const flags = ns.flags(argsSchema);
  ns.tprint(JSON.stringify(flags));
  let moneyGained = await ns.hack(flags['target'])
  ns.toast("Hacked " + flags['target'] + " for " + moneyGained);

  let server = ns.getServer(flags['target'])

  //We have to do this on home for now to make sure files end up in right places
  let weakenThreads = 1;
  while(ns.weakenAnalyze(weakenThreads, 1) < server.hackDifficulty - server.minDifficulty) {
    weakenThreads += 1;
  }
  ns.exec('/reap-scripts/reapHackWeaken.js', 'home', weakenThreads, '--target', flags['target'], '--hackthreads', flags['hackthreads'], '--hackweakenthreads', weakenThreads)
}