const argsSchema = [
  ['target', 'n00dles'],
  ['sleep', 0],
  ['expectedweakens', 1],
  ['expectedgrows', 1],
  ['reapPercentage', 5],
  ['expectedEndTime', 0],
]

export function autocomplete(data, args) {
  data.flags(argsSchema);
  return [];
}


/** @param {NS} ns **/
export async function main(ns) {
  const flags = ns.flags(argsSchema);
  await ns.sleep(flags['sleep'])
  let hacked = await ns.hack(flags['target'])

  let server = ns.getServer(flags['target'])
  let weakenThreads = 1;
  while(ns.weakenAnalyze(weakenThreads, 1) < server.hackDifficulty - server.minDifficulty) {
    weakenThreads += 1;
  }

  weakenThreads += 5;

  if( hacked > 0) {
    let growThreads = Math.ceil(ns.growthAnalyze(flags['target'], server.moneyMax / server.moneyAvailable)) + 5;

    if (flags['expectedgrows'] !== growThreads || flags['expectedweakens'] !== weakenThreads) {
      try {
        let reapJson = ns.read('/reap/reap-' + flags['target'] + '-' + flags['reapPercentage'] + '.txt');
        let reapConfig = JSON.parse(reapJson);
        reapConfig.grow = growThreads;
        reapConfig.hackWeaken = weakenThreads;
        await ns.write('/reap/reap-' + flags['target'] + '-' + flags['reapPercentage'] + '.txt', JSON.stringify(reapConfig), 'w');
        await ns.scp('/reap/reap-' + flags['target'] + '-' + flags['reapPercentage'] + '.txt', 'home');
      } catch (e) {
        ns.print("Looks like debug was set despite debug already being run");
      }
    } else {
      try {
        let reapJson = ns.read('/reap/reap-' + flags['target'] + '-' + flags['reapPercentage'] + '.txt');
        let reapConfig = JSON.parse(reapJson);
        reapConfig.hackDebug = false;
        ns.toast("Removing debug from hack config");
        await ns.write('/reap/reap-' + flags['target'] + '-' + flags['reapPercentage'] + '.txt', JSON.stringify(reapConfig), 'w');
        await ns.scp('/reap/reap-' + flags['target'] + '-' + flags['reapPercentage'] + '.txt', 'home');
      } catch (e) {
        ns.print("Looks like debug was set despite debug already being run");
      }
    }
  }
}