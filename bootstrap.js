function removeTempFiles(ns) {
  ns.ls('home', '/temp/')
}

/** @param {NS} ns **/
export async function main(ns) {
  ns.tprintf("Bootstrapping the Vitain AI Systems")
  ns.tprintf("Removing unused Files:")
  ns.tprintf("Removing cycle-config.txt");
  ns.rm('/temp/cycle-config.txt')
  ns.rm('/tasks.txt')
  ns.rm('/threadCounts.txt')
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
  let cycleStatePid = ns.exec('/debug/cycle.js', 'home')
  while(ns.isRunning(cycleStatePid, 'home')){
    await ns.sleep(100);
  }

  ns.exec('clear-reap-config.js', 'home');
  if(ns.exec('test-targeting.js', 'home') === 0){
    ns.tprintf("Failed to start automated hacking systems")
  }
  if(ns.exec('/management/tor.js', 'home') === 0){
    ns.tprintf("Failed to start automatic onion router management system")
  };
  if(ns.exec('/daemon.js', 'home') === 0){
    ns.tprintf("Failed to initalize thread management daemon.")
  };
  ns.exec('/probe.js', 'home');
  await ns.sleep(100);
  ns.tail('/probe.js', 'home');

  if(ns.exec('/dashboard/cycle.js', 'home') !== 0){
    await ns.sleep(100);
    ns.tail('/dashboard/cycle.js', 'home')
  }
}