import {getFreeRam, getOwnedServers} from "/helpers";
import {calculateReapRam, executeReap, getReapThreads, getReapTimings} from "./reap";

const GROW = "grow";
const WEAKEN = "weaken";
const REAP = "reap";
const HACK = "hack";

let tasks = [];
let activeThreads = {};
let reapEndAfter = {};
let maxGainSeen = {};

function auditTasks(ns) {
  let threadCounts = {};
  for(let i = 0; i < tasks.length; i++){
    if (threadCounts[tasks[i].target]) {
      threadCounts[tasks[i].target][tasks[i].action] += tasks[i].threads;
    } else {
      threadCounts[tasks[i].target] = {
        hack: 0,
        grow: 0,
        weaken: 0,
      }
      threadCounts[tasks[i].target][tasks[i].action] += tasks[i].threads;
    }
  }

  for(let key of Object.keys(threadCounts)){
    if(threadCounts[key].grow !== activeThreads[key].grow){
      ns.tprint("Grow thread counts mismatch");
    }
    if(threadCounts[key].hack !== activeThreads[key].hack){
      ns.tprint("Grow thread counts mismatch");
    }
    if(threadCounts[key].weaken !== activeThreads[key].weaken){
      ns.tprint("Grow thread counts mismatch");
    }
  }

  for(let key of Object.keys(activeThreads)) {
    if (threadCounts[key]) {
      if (activeThreads[key].grow !== 0 && threadCounts[key].grow !== activeThreads[key].grow) {
        ns.tprint("Grow thread counts mismatch");
      }
      if (activeThreads[key].hack !== 0 && threadCounts[key].hack !== activeThreads[key].hack) {
        ns.tprint("Grow thread counts mismatch");
      }
      if (activeThreads[key].weaken !== 0 && threadCounts[key].weaken !== activeThreads[key].weaken) {
        ns.tprint("Grow thread counts mismatch");
      }
    } else {
      if(activeThreads[key].grow !== 0 || activeThreads[key].hack !== 0 || activeThreads[key].weaken !== 0) {
        ns.tprint("No thread counts for " + key)
        ns.tprint(JSON.stringify(activeThreads[key], null, 2));
      }
    }
  }

  activeThreads = threadCounts;
}

async function clearFinishedTasks(ns) {
  let removed = 0;
  let kept = 0;
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].pid === 0) {
        continue;
      }

      if (!ns.isRunning(tasks[i].pid, tasks[i].host)) {
        removed++;
        tasks[i].pid = 0;
        if (activeThreads[tasks[i].target]) {
          activeThreads[tasks[i].target][tasks[i].action] -= tasks[i].threads;
        }
      } else {
        kept++;
      }
    }

    tasks = tasks.filter(task => task.pid !== 0);
    ns.print("Kept " + kept + " tasks and removed " + removed);
}

/**
 *
 * @param {NS} ns
 * @param {string} hostname
 */
function clearReapsForHost(ns, hostname){
  let scripts = ns.ls('home', 'reap/reap-'+hostname);
  scripts.map( script => {
    ns.rm(script, 'home');
  })
}

/**
 * @params {NS} ns
 * @params {Server} target
 * @returns {GrowJob}
 */
function createGrowJob(ns, target){
  let desiredGrowth = target.moneyMax / target.moneyAvailable;
  let requiredThreads = Math.ceil(ns.growthAnalyze(target.hostname, desiredGrowth));
  let securityImpact = ns.growthAnalyzeSecurity(requiredThreads);

  let requiredWeakenThreads = 1;
  while( securityImpact > ns.weakenAnalyze(requiredWeakenThreads)){
    requiredWeakenThreads++;
  }

  let requiredMem = requiredThreads * ns.getScriptRam('/remote/doGrow.js', 'home') +
    requiredWeakenThreads * ns.getScriptRam('remote/doWeaken.js', 'home');

  return {
    task: GROW,
    target: target.hostname,
    growThreads: requiredThreads,
    weakenThreads: requiredWeakenThreads,
    requiredMem: requiredMem
  }
}

function addTask(task){
  tasks.push(task);
  if(!activeThreads[task.target]){
    activeThreads[task.target] = {
      hack: 0,
      grow: 0,
      weaken: 0,
    };
  }
  activeThreads[task.target][task.action] += task.threads;
}

/**
 * @params {NS} ns
 * @params {Server} target
 * @returns {WeakenJob}
 */
function createWeakenJob(ns, target){
  let securityImpact = target.hackDifficulty - target.minDifficulty;
  let requiredWeakenThreads = 1;
  while( securityImpact > ns.weakenAnalyze(requiredWeakenThreads)){
    requiredWeakenThreads++;
  }

  let requiredMem = requiredWeakenThreads * ns.getScriptRam('/remote/doWeaken.js', 'home');

  return {
    task: WEAKEN,
    target: target.hostname,
    weakenThreads: requiredWeakenThreads,
    requiredMem: requiredMem
  }
}

/**
 * @param {NS} ns
 * @param {WeakenJob} job
 * @returns
 */
async function scheduleWeaken(ns, job){
  clearReapsForHost(ns, job.target);
  let totalScheduled = 0;
  let startingThreads = 0;
  if(activeThreads[job.target] && activeThreads[job.target][WEAKEN] > 0){
    totalScheduled = activeThreads[job.target][WEAKEN];
    startingThreads = activeThreads[job.target][WEAKEN];
  }

  let servers = getOwnedServers(ns);
  // Go from minimum to maximum ram to keep bigger hosts for reaps
  servers = servers.sort( (a, b) => getFreeRam(a) - getFreeRam(b));
  let lastPid = 0;
  let lastHost = '';
  for(let i = 0; i < servers.length; i++){
    let server = servers[i];
    let remainingThreads = job.weakenThreads - totalScheduled;
    if(remainingThreads <= 0) {
      return;
    }
    let freeRam = getFreeRam(server);
    let canRunThreads = Math.floor(freeRam / ns.getScriptRam('/remote/doWeaken.js'));
    let threadsToRun = Math.min(canRunThreads, remainingThreads);
    if( threadsToRun > 0) {
      await ns.scp('/remote/doWeaken.js', 'home', server.hostname)
      let pid = ns.exec('/remote/doWeaken.js', server.hostname, threadsToRun, job.target, 0)
      if ( pid !== 0) {
        totalScheduled += threadsToRun;
        lastPid = pid;
        lastHost = server.hostname;
      }
    }
  }

  if (totalScheduled > startingThreads) {
    addTask({
      pid: lastPid,
      target: job.target,
      action: WEAKEN,
      threads: totalScheduled-startingThreads,
      host: lastHost
    });
    return true;
  }
  return false;
}

/**
 * @param {NS} ns
 * @param {ReapJob} job
 * @returns
 */
async function scheduleReap(ns, job) {
  let purchasedServers = ns.getPurchasedServers();
  purchasedServers.push('home');
  let servers = [];
  purchasedServers.map( hostname => servers.push(ns.getServer(hostname)));
  servers = servers.sort( (a, b) => getFreeRam(b) - getFreeRam(a));

  let maxRamAvailable = getFreeRam(servers[0]);
  let percentage = 15;
  let reapConfig = await getReapThreads(ns, job.target, percentage);
  let requiredRam = calculateReapRam(ns, reapConfig)
  let reaping = true;
  let itter = 0;
  while(reaping === true && itter < 60) {
    reaping = false;
    itter++;
    while (maxRamAvailable < requiredRam && percentage > 0) {
      percentage = percentage - .5;
      reapConfig = await getReapThreads(ns, job.target, percentage);
      requiredRam = calculateReapRam(ns, reapConfig)
    }

    let reapTimings = getReapTimings(ns, job.target);
    let reapOffset = 0;
    if (reapEndAfter[job.target] > 0) {
      reapOffset = reapEndAfter[job.target] - Date.now() + 1000 - reapTimings.timeToExecute;
      if (reapOffset < 0) {
        reapOffset = 0;
      }
    }

    if (percentage > 0 && reapOffset < 1000*60) {
      let pids = await executeReap(ns, reapConfig, job.target, servers[0].hostname, reapOffset, percentage)
      if (pids != null) {
        reaping = true;
        ns.print("Scheduled reap against: " + job.target + " for " + percentage + "%");
        addTask({
          target: job.target,
          action: HACK,
          threads: reapConfig.hack,
          host: servers[0].hostname,
          pid: pids.hackPid
        });

        addTask({
          target: job.target,
          action: WEAKEN,
          threads: reapConfig.hackWeaken,
          host: servers[0].hostname,
          pid: pids.hackWeakenPid
        });

        addTask({
          target: job.target,
          action: GROW,
          threads: reapConfig.grow,
          host: servers[0].hostname,
          pid: pids.growPid
        });

        addTask({
          target: job.target,
          action: WEAKEN,
          threads: reapConfig.growWeaken,
          host: servers[0].hostname,
          pid: pids.growWeakenPid
        });
      }

      reapEndAfter[job.target] = Date.now() + reapOffset + reapTimings.timeToExecute;
    }
  }
}

/**
 * @param {NS} ns
 * @param {GrowJob} job
 * @returns
 */
async function scheduleGrow(ns, job){
  clearReapsForHost(ns, job.target);
  let totalScheduled = 0;
  let startingThreads = 0;
  if(activeThreads[job.target] && activeThreads[job.target][GROW] > 0){
    totalScheduled = activeThreads[job.target][GROW];
    startingThreads = activeThreads[job.target][GROW];
  }

  let servers = getOwnedServers(ns);
  let totalWeakensScheduled = 0;
  servers = servers.sort( (a, b) => getFreeRam(a) - getFreeRam(b));
  let lastPid = 0;
  let lastWeakenPid = 0;
  let lastHost = '';
  let lastWeakenHost = '';
  for(let i = 0; i < servers.length; i++){
    let server = servers[i];
    let remainingThreads = Math.ceil(job.growThreads - totalScheduled);
    let freeRam = getFreeRam(server);
    let canRunThreads = Math.floor(freeRam / ns.getScriptRam('/remote/doGrow.js'));
    let threadsToRun = Math.min(canRunThreads, remainingThreads);
    if( threadsToRun > 0) {
      let calculateWeakensForGrow = (growThreads) => {
        let weakenThreads = 2;
        while (ns.weakenAnalyze(weakenThreads-1) < ns.growthAnalyzeSecurity(growThreads)) {
          weakenThreads += 1;
        }
        return weakenThreads;
      }

      while(freeRam < calculateWeakensForGrow(threadsToRun)*ns.getScriptRam('/remote/doWeaken.js') + threadsToRun * ns.getScriptRam('/remote/doGrow.js')) {
        threadsToRun -= 1;
      }
      let weakenThreads = calculateWeakensForGrow(threadsToRun);
      if(threadsToRun <= 0 || weakenThreads <= 0) {
        continue;
      }

      await ns.scp('/remote/doGrow.js', 'home', server.hostname);
      let pid = ns.exec('/remote/doGrow.js', server.hostname, threadsToRun, '--target', job.target, '--sleep', 0, '--expectedweakens', weakenThreads, '--reapPercentage', 0, '--manipulateStock', false);
      if ( pid != 0) {
        totalScheduled += threadsToRun;
        lastPid = pid;
        lastHost = server.hostname;

        await ns.scp('/remote/doWeaken.js', 'home', server.hostname);
        let weakenPid = ns.exec('/remote/doWeaken.js', server.hostname, weakenThreads, job.target, 0, pid);
        if (weakenPid != 0 ) {
          totalWeakensScheduled += weakenThreads;
          lastWeakenPid = weakenPid;
          lastWeakenHost = server.hostname;
        } else {
          ns.toast("Failed to schedule weakens for grow pid:" + pid + " threads: " + weakenThreads, 'error');
        }
      }
    }
  }

  if (totalScheduled-startingThreads > 0) {
    addTask({
      pid: lastPid,
      target: job.target,
      action: GROW,
      threads: totalScheduled-startingThreads,
      host: lastHost
    });
    addTask({
      pid: lastWeakenPid,
      target: job.target,
      action: WEAKEN,
      threads: totalWeakensScheduled,
      host: lastWeakenHost
    })
    return true;
  }

  return false;
}

/**
 *
 * @param {NS} ns
 * @param {Server[]} servers
 * @returns {Job[]}
 */
function createJobsForServers(ns, servers) {
  let jobs = [];
  for(let i = 0; i < servers.length; i++) {
    let server = servers[i]
    if( server.hackDifficulty - server.minDifficulty < 5 && server.moneyAvailable/server.moneyMax > .8 && activeThreads[server.hostname] && activeThreads[server.hostname].hack > 0 && i < 5){
      jobs.push({
        target: server.hostname,
        task: REAP,
        requiredMem: 1
      })
    } else if( server.minDifficulty !== server.hackDifficulty && server.hasAdminRights) {
      jobs.push(createWeakenJob(ns, server));
    } else if (server.moneyAvailable !== server.moneyMax && server.hasAdminRights) {
      jobs.push(createGrowJob(ns, server));
    } else if(i < 5){
      jobs.push({
        target: server.hostname,
        task: REAP,
        requiredMem: 1
      })
    }
  }

  return jobs;
}

/** @param {NS} ns **/
export async function main(ns) {
  ns.disableLog('scan');
  ns.disableLog('scp');
  ns.disableLog('exec');
    ns.tprint("Starting Hack Manager");

    if(ns.fileExists('tasks.txt')){
      tasks = JSON.parse(ns.read('tasks.txt'));
    } else {
      tasks = [];
    }

    if(ns.fileExists('threadCounts.txt')) {
      activeThreads = JSON.parse(ns.read('threadCounts.txt'));
    } else {
      activeThreads = {};
    }

    let lastAudit = Date.now()-50000;

    while(true) {
      if(Date.now() - lastAudit > 60* 1000){
        lastAudit = Date.now();
        auditTasks(ns);
      }
      await clearFinishedTasks(ns);
      let servers;
      if (ns.fileExists('formulas.exe', 'home')) {
        // Calculate server profitability order
        ns.print("We have formulas")
      } else {
      }

      let hosts = getOwnedServers(ns);
      hosts = hosts.filter(server => server.moneyAvailable > 0);
      hosts.map( server => {
        if(!maxGainSeen[server.hostname] || maxGainSeen[server.hostname] < ns.hackAnalyze(server.hostname) * server.moneyAvailable) {
          maxGainSeen[server.hostname] = ns.hackAnalyze(server.hostname) * server.moneyAvailable;
        }
      })
      hosts.sort((a, b) => {
        return maxGainSeen[b.hostname] - maxGainSeen[a.hostname]
      })
      servers = hosts;


      let jobs = createJobsForServers(ns, servers)


      for(let i = 0; i < jobs.length; i++){
        let job = jobs[i];
        if (job.task === 'weaken') {
          await scheduleWeaken(ns, job);
        } else if (job.task === 'grow') {
          await scheduleGrow(ns, job);
        } else if (job.task === 'reap') {
          await scheduleReap(ns, job);
        }
      }

      let serversToIdle = getOwnedServers(ns);
      let totalGrows = 0;
      for(let i = 0; i < serversToIdle.length; i++){
        let executor = serversToIdle[i]
        if(executor.hostname === 'home' || executor.hostname.startsWith('hax-')){
          continue;
        }
        let threads = (executor.maxRam - executor.ramUsed) / ns.getScriptRam('/remote/doGrow.js');
        if (Math.floor(threads) > 0) {
          await ns.scp('/remote/doGrow.js', 'home', executor.hostname)


          let idlePid = ns.exec('/remote/doGrow.js', executor.hostname, Math.floor(threads), '--target', 'joesguns', '--manipulateStock', true);
          if(idlePid != 0) {
            totalGrows += Math.floor(threads);
            addTask({
              target: 'joesguns',
              action: GROW,
              threads: Math.floor(threads),
              host: executor.hostname,
              pid: idlePid
            });
          }

        }
      }

      await ns.write('tasks.txt', JSON.stringify(tasks), 'w');
      await ns.write('threadCounts.txt', JSON.stringify(activeThreads), 'w');
      await ns.write('gains.txt', JSON.stringify(maxGainSeen), 'w');
      await ns.sleep(1000);
    }
}