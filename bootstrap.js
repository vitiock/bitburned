function removeTempFiles(ns) {
  ns.ls('home', '/temp/')
}

/** @param {NS} ns **/
export async function main(ns) {
  ns.tprintf("Bootstrapping the Vitain AI Systems")
  ns.tprintf("Removing unused Files:")
  ns.tprintf("Removing cycle-config.txt");
  ns.rm('/temp/cycle-config.txt')
  ns.tprintf("Removing dynamic augment data...")
  let augmentFiles = ns.ls('home', '/temp/augment')
  for(let i = 0; i < augmentFiles.length; i++){
    ns.tprintf(augmentFiles[i])
    ns.rm(augmentFiles[i])
  }

  ns.tprintf("Generating cycle configuration...");
  let cycleConfigPid = ns.exec('/data/generate-cycle-config.js', 'home')
  while(ns.isRunning(cycleConfigPid, 'home')){
    await ns.sleep(100);
  }
  ns.exec('clear-reap-config.js', 'home');
  ns.exec('test-targeting.js', 'home');
  ns.exec('/management/tor.js', 'home');
  ns.exec('/management/cycle.js', 'home')
  ns.exec('/daemon.js', 'home');
  ns.exec('/probe.js', 'home');
  ns.tail('/probe.js', 'home');
}