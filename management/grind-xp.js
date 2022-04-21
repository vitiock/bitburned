import {canReap, getExploitableServers} from './targeting.js'

/** @param {NS} ns **/
export async function main(ns) {
  let targets = ['home']
  let scanned = []

  let hostList = []

  while (targets.length > 0) {
    let name = targets.pop();
    scanned.push(name);

    let server = await ns.getServer(name);
    hostList.push(server);
    if (name.startsWith('hax-')) {
    } else if (server.hasAdminRights && server.requiredHackingSkill <= ns.getPlayer().hacking) {
      let hosts = await ns.scan(name);
      for (let i = 0; i < hosts.length; i++) {
        if (!scanned.includes(hosts[i])) {
          targets.push(hosts[i]);
        }
      }
    }
  };

  let useIdleThreads = []
  scanned.map( hostname => {
    let server = ns.getServer(hostname);
    if (server.hasAdminRights) {
      useIdleThreads.push(server);
    }
  })

  while( true ) {
    let totalWeak = 0;
    for(let i = 0; i < useIdleThreads.length; i++){
      let server = useIdleThreads[i]
      let executor = ns.getServer(server.hostname);
      let threads = (executor.maxRam - executor.ramUsed) / ns.getScriptRam('/remote/doGrow.js');
      if (Math.floor(threads) > 0) {
        //ns.tprint("boop: " + server.hostname + " " + threads);
        await ns.scp('/remote/doGrow.js', server.hostname);
        await ns.exec('/remote/doGrow.js', server.hostname, Math.floor(threads), 'joesguns', 0);
        totalWeak += Math.floor(threads);
      }
    }

    ns.toast("Scheduled  " + totalWeak + " threads of grow against joes");
    let sleepTime = await ns.getWeakenTime('joesguns')+50;
    await ns.sleep(sleepTime);
  }
}