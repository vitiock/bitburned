import {getFreeRam} from "./helpers";

/**
 *
 * @param {NS} ns
 * @param {string} hostname
 * @returns {{hack: number, grow: number, debug: boolean, growWeaken: number, hackWeaken: number}}
 */
export async function getReapThreads(ns, hostname, reapPercentage) {
  if(ns.fileExists('formulas.exe')) {
    //ns.tprint("We have formulas to calculate reap");
    let server = ns.getServer(hostname);
    let player = ns.getPlayer();
    let hackPercentage = ns.formulas.hacking.hackPercent(server, player);
    let formulaHackThreads = Math.max(5/hackPercentage);
    server.moneyAvailable -= server.moneyMax*formulaHackThreads*hackPercentage
  }
  if (ns.fileExists('/reap/reap-' + hostname + '-'+reapPercentage.toString() + '.txt')) {
    let reapConfigJson = await ns.read('/reap/reap-' + hostname + '-'+reapPercentage.toString() + '.txt');
    let reapConfig = JSON.parse(reapConfigJson);
    if(reapConfig.hack && reapConfig.hack > 0) {
      return reapConfig;
    }
  }

  let gain = ns.hackAnalyze(hostname);
  let hackThreads = Math.ceil((reapPercentage/100) / gain);

  let hackAffect = ns.hackAnalyzeSecurity(hackThreads);

  let weakenThreads = 1;
  while (ns.weakenAnalyze(weakenThreads, 1) < hackAffect) {
    weakenThreads += 1;
  }

  // Add an extra 5 grow threads just to be on the safe side
  let growthThreads = Math.ceil(ns.growthAnalyze(hostname, 1/(1-(reapPercentage/100))));

  let growthAffect = ns.growthAnalyzeSecurity(growthThreads)
  let growthWeakenThreads = 1
  while (ns.weakenAnalyze(growthWeakenThreads) < growthAffect) {
    growthWeakenThreads++;
  }

  let reapConfig = {
    hack: hackThreads,
    hackWeaken: weakenThreads,
    grow: growthThreads,
    growWeaken: growthWeakenThreads,
    debug: true
  }

  await ns.write('/reap/reap-' + hostname + '-'+reapPercentage.toString() + '.txt', JSON.stringify(reapConfig), 'w');

  return reapConfig;
}

/**
 *
 * @param {NS} ns
 * @param {{hack: number, grow: number, debug: boolean, growWeaken: number, hackWeaken: number}} reapConfig
 * @param {string} target
 * @param {string} executor
 * @param {number} offset
 * @param {number} percentage
 * @returns {{hackPid: number, growPid: number, hackWeakenPid: number, growWeakenPid: number} | null}
 */
export async function executeReap(ns, reapConfig, target, executor, offset, percentage) {
  let reapTimings = getReapTimings(ns, target)
  let reapScripts = getReapScripts(reapConfig);
    let totalRam = getNeededRamForReap(ns, reapConfig, reapScripts)


  let server = ns.getServer(executor)
  if ( getFreeRam(server) > totalRam) {
    // Make sure scripts exist on the host
    await ns.scp(reapScripts.hack, 'home', executor)
    await ns.scp(reapScripts.grow, 'home', executor)
    await ns.scp(reapScripts.weaken, 'home', executor)
    await ns.scp('/reap/reap-'+target+'-'+percentage+'.txt', 'home', executor);
    //TODO: Move to use scripts that have start time vs sleep time to reduce imprecision of script start
    let hackPid = ns.exec(reapScripts.hack, executor, reapConfig.hack, '--target', target, '--sleep', reapTimings.hackSleep+offset, '--expectedweakens', reapConfig.hackWeaken, '--expectedgrows', reapConfig.grow, '--reapPercentage', percentage);
    let hackWeakenPid = ns.exec(reapScripts.weaken, executor, reapConfig.hackWeaken, target, reapTimings.hackWeakenSleep+offset, "Reap Hack Weaken", Date.now());
    let growPid = ns.exec(reapScripts.grow, executor, reapConfig.grow, '--target', target, '--sleep', reapTimings.growSleep+offset, '--expectedweakens', reapConfig.growWeaken, '--reapPercentage', percentage);
    let growWeakenPid = ns.exec(reapScripts.weaken, executor, reapConfig.growWeaken, target, reapTimings.growWeakenSleep+offset, "Reap Grow Weaken", Date.now());

    if(hackPid === 0 || hackWeakenPid === 0 || growPid === 0 || growWeakenPid === 0){
      ns.toast("Failed to create proper reap for " + target + " on " + executor, 'error');
      ns.print("Failed to create proper reap PIDS (" + hackPid + ", " + hackWeakenPid + ", " + growPid + ", " + growWeakenPid + ")" );
    }

    return {
      hackPid: hackPid,
      hackWeakenPid: hackWeakenPid,
      growPid: growPid,
      growWeakenPid: growWeakenPid
    }
  }
  return null;
}

/**
 *
 * @param {NS} ns
 * @param {{hack: number, grow: number, debug: boolean, growWeaken: number, hackWeaken: number}} reapConfig
 * @param {{hack: string, grow: string, weaken: string}} reapScripts
 */
function getNeededRamForReap(ns, reapConfig, reapScripts) {
  return reapConfig.hack * ns.getScriptRam(reapScripts.hack) +
    reapConfig.hackWeaken * ns.getScriptRam(reapScripts.weaken) +
    reapConfig.grow * ns.getScriptRam(reapScripts.grow) +
    reapConfig.growWeaken * ns.getScriptRam(reapScripts.weaken);}

/**
 *
 * @param {{hack: number, grow: number, debug: boolean, growWeaken: number, hackWeaken: number}} reapConfig
 * @returns {{hack: string, grow: string, weaken: string}}
 */
function getReapScripts(reapConfig) {
  if(reapConfig.debug){
    return {
      hack: '/remote/doDebugHack.js',
      grow: '/remote/doDebugGrow.js',
      weaken: '/remote/doWeaken.js'
    }
  }
  return {
    hack: '/remote/doHack.js',
    grow: '/remote/doGrow.js',
    weaken: '/remote/doWeaken.js'
  }
}

export function getReapTimings(ns, targetHostname){
  let weakenTime = ns.getWeakenTime(targetHostname);
  let growTime = ns.getGrowTime(targetHostname);
  let hackTime = ns.getHackTime(targetHostname);

  let hackSleep = 0;
  let hackWeakenSleep = 0;
  let growSleep = 0;
  let growWeakenSleep = 0;

  if (weakenTime > hackTime && weakenTime > growTime) {
    hackSleep = weakenTime - hackTime - 20;
    hackWeakenSleep = 0;
    growSleep = weakenTime - growTime + 20;
    growWeakenSleep = 40;
  }
// debug
  if (growTime > weakenTime && growTime > hackTime) {
    hackSleep = growTime - hackTime - 20;
    hackWeakenSleep = growTime - weakenTime - 10;
    growSleep = 0;
    growWeakenSleep = growTime - weakenTime + 10;
  }

  if (hackTime > weakenTime && hackTime > growTime) {
    hackSleep = 0;
    hackWeakenSleep = hackTime - weakenTime + 10;
    growSleep = hackTime - growTime + 20;
    growWeakenSleep = hackTime - weakenTime + 30;
  }

  return {
    hackSleep: hackSleep,
    hackWeakenSleep: hackWeakenSleep,
    growSleep: growSleep,
    growWeakenSleep: growWeakenSleep,
    timeToExecute: weakenTime + growWeakenSleep
  }
}

/**
 *
 * @param {NS} ns
 * @param {{hack: number, grow: number, debug: boolean, growWeaken: number, hackWeaken: number}} reapConfig
 */
export function calculateReapRam(ns, reapConfig) {
  if(reapConfig.debug){
    let hackRam = ns.getScriptRam('/remote/doDebugHack.js') * reapConfig.hack;
    let hackWeakenRam = ns.getScriptRam('/remote/doWeaken.js') * reapConfig.hackWeaken;
    let growRam = ns.getScriptRam('/remote/doDebugGrow.js') * reapConfig.grow;
    let growWeakenRam = ns.getScriptRam('/remote/doWeaken.js') * reapConfig.growWeaken;

    return hackRam + hackWeakenRam + growRam + growWeakenRam;
  }
  let hackRam = ns.getScriptRam('/remote/doHack.js') * reapConfig.hack;
  let hackWeakenRam = ns.getScriptRam('/remote/doWeaken.js') * reapConfig.hackWeaken;
  let growRam = ns.getScriptRam('/remote/doGrow.js') * reapConfig.grow;
  let growWeakenRam = ns.getScriptRam('/remote/doWeaken.js') * reapConfig.growWeaken;

  return hackRam + hackWeakenRam + growRam + growWeakenRam;
}