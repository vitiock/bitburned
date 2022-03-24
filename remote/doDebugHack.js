const argsSchema = [
  ['target', 'n00dles'],
  ['sleep', 0],
  ['expectedweakens', 1],
  ['expectedgrows', 1],
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

  weakenThreads += 2;

  if( hacked > 0) {
    if (flags['expectedweakens'] != weakenThreads) {
      ns.toast("Expected threads: " + flags['expectedweakens'] + " Actual weaken threads required: " + weakenThreads, 'info', 5000);
    }


    let growThreads = Math.ceil(ns.growthAnalyze(flags['target'], server.moneyMax / server.moneyAvailable)) + 2;
    if (flags['expectedgrows'] != growThreads) {
      ns.toast('Expected grow threads: ' + flags['expectedgrows'] + " Actual grow threads required: " + Math.ceil(growThreads), 'info', 5000);
    }

    if (flags['expectedgrows'] != growThreads || flags['expectedweakens'] != weakenThreads) {
      let reapJson = ns.read('/reap/reap-' + flags['target'] + '-5.txt');
      let reapConfig = JSON.parse(reapJson);
      reapConfig.grow = growThreads;
      reapConfig.hackWeaken = weakenThreads;
      await ns.write('/reap/reap-' + flags['target'] + '-5.txt', JSON.stringify(reapConfig), 'w');
      await ns.scp('/reap/reap-' + flags['target'] + '-5.txt', 'home');
    } else {
      let reapJson = ns.read('/reap/reap-' + flags['target'] + '-5.txt');
      let reapConfig = JSON.parse(reapJson);
      reapConfig.hackDebug = false;
      await ns.write('/reap/reap-' + flags['target'] + '-5.txt', JSON.stringify(reapConfig), 'w');
      await ns.scp('/reap/reap-' + flags['target'] + '-5.txt', 'home');
    }

    ns.toast("Hacked " + hacked + " moneys from: " + flags['target']);
  } else {
    ns.toast("Failed to hack " + flags['target']);
  }
}