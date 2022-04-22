const argsSchema = [
  ['loop', false],
  ['help', false]
]

function displayHelpInfo(ns){
  ns.tprintf("\n\n=== NUKE Servers =====")
  ns.tprintf("Script for backdooring servers")
  ns.tprintf("\n")
  ns.tprintf("=== Flags ============")
  ns.tprintf("--help : Displays this information on how to use the script.")
  ns.tprintf("--loop : Run the script in a loop instead of a single time.\n\n\n")
}

let PRIORITY_SERVERS = [
  'avmnite-02h',
  'I.I.I.I',
  'run4theh111z',
  'w0rld_d43m0n',
  'The-Cave'
];

/** @param {NS} ns **/
export async function main(ns) {
  let flags = ns.flags(argsSchema);

  if(flags.help){
    displayHelpInfo(ns);
    return;
  }

  do {
    let servers = JSON.parse(ns.read('/temp/servers.txt'))

    let serverMap = {}
    servers.map( server => {
      serverMap[server.hostname] = server;
    })

    for(let hostname of PRIORITY_SERVERS){
      ns.tprint(hostname);
      if(serverMap[hostname] && serverMap[hostname].backdoorInstalled === false && serverMap[hostname].requiredHackingSkill < ns.getPlayer().hacking ){
        ns.tprint(serverMap[hostname].hackDifficulty);
        let hostToPwn = serverMap[hostname];
        let path = [];
        while(hostToPwn.parent && hostToPwn.parent !== 'home'){
          path.unshift(hostToPwn.hostname);
          hostToPwn = serverMap[hostToPwn.parent]
          await ns.sleep(100);
        }

        ns.tprint(JSON.stringify(path));
        for(let hostname of path){
          ns.connect(hostname);
        }
        await ns.installBackdoor();
        ns.connect('home');
      }
    }

    for(let server of servers){
      if(!PRIORITY_SERVERS.includes(server.hostname) && server.backdoorInstalled === false && server.requiredHackingSkill < ns.getPlayer().hacking) {
        let hostToPwn = server;
        let path = [];
        while(hostToPwn.parent && hostToPwn.parent !== 'home'){
          path.unshift(hostToPwn.hostname);
          hostToPwn = serverMap[hostToPwn.parent]
          await ns.sleep(100);
        }

        ns.tprint(JSON.stringify(path));
        for(let hostname of path){
          ns.connect(hostname);
        }

        await ns.installBackdoor();
        ns.connect('home');
      }
    }

    if(flags.loop) {
      await ns.sleep(100);
    }
  } while (flags.loop);
}