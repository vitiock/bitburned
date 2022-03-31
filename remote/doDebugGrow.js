const argsSchema = [
  ['target', 'n00dles'],
  ['sleep', 0],
  ['expectedweakens', 1],
  ['reapPercentage', 5]
]

export function autocomplete(data, args) {
  data.flags(argsSchema);
  return [];
}


/** @param {NS} ns **/
export async function main(ns) {
  const flags = ns.flags(argsSchema);
  await ns.sleep(flags['sleep'])
  let grow = await ns.grow(flags['target'])

  let server = ns.getServer(flags['target'])
  let weakenThreads = 1;
  while(ns.weakenAnalyze(weakenThreads, 1) < server.hackDifficulty - server.minDifficulty) {
    weakenThreads += 1;
  }
  weakenThreads += 2;

  if(flags['expectedweakens'] != weakenThreads) {
    ns.toast("Expected threads: " + flags['expectedweakens'] + " Actual weaken threads required: " + weakenThreads, 'info', 5000);
  }


  if(flags['expectedweakens'] != weakenThreads){
    try {
      let reapJson = ns.read('/reap/reap-' + flags['target'] + '-' + flags['reapPercentage'] + '.txt');
      let reapConfig = JSON.parse(reapJson);
      reapConfig.growWeaken = weakenThreads;
      reapConfig.hackDebug = true;
      await ns.write('/reap/reap-' + flags['target'] + '-' + flags['reapPercentage'] + '.txt', JSON.stringify(reapConfig), 'w');
      await ns.scp('/reap/reap-' + flags['target'] + '-' + flags['reapPercentage'] + '.txt', 'home');
    } catch (e) {
      ns.print("Looks like status was set back to debug despite debug already running")
    }
  } else {
    try {
      let reapJson = ns.read('/reap/reap-' + flags['target'] + '-' + flags['reapPercentage'] + '.txt');
      let reapConfig = JSON.parse(reapJson);
      if (!reapConfig.hackDebug) {
        reapConfig.debug = false;
      }
      await ns.write('/reap/reap-' + flags['target'] + '-' + flags['reapPercentage'] + '.txt', JSON.stringify(reapConfig), 'w');
      await ns.scp('/reap/reap-' + flags['target'] + '-' + flags['reapPercentage'] + '.txt', 'home');
    } catch (e) {
      ns.print("Looks like status was set back to debug despite debug already running")
    }
  }
}