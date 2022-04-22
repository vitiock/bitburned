const argsSchema = [
  ['loop', false],
  ['help', false]
]

function displayHelpInfo(ns){
  ns.tprintf("\n\n=== NUKE Servers =====")
  ns.tprintf("This script attempts to compromise every server and nuke it.")
  ns.tprintf("\n")
  ns.tprintf("=== Flags ============")
  ns.tprintf("--help : Displays this information on how to use the script.")
  ns.tprintf("--loop : Run the script in a loop instead of a single time.\n\n\n")
}

/** @param {NS} ns **/
export async function main(ns) {


  let flags = ns.flags(argsSchema);
  if(flags.help){
    displayHelpInfo(ns);
    return;
  }

  do {
    let servers = JSON.parse(ns.read('/temp/servers.txt'))
    let nukedServers = servers.map( server => {
      if(server.purchasedByPlayer) {
        return {hostname: server.hostname, nuked: true, new: false};
      }
      if(server.hasAdminRights){
        return {hostname: server.hostname, nuked: true, new: false};
      }
      let nuked = true;
      try { ns.brutessh(server.hostname) } catch (e) {}
      try {ns.ftpcrack(server.hostname) } catch (e) {}
      try {ns.relaysmtp(server.hostname) } catch (e) {}
      try {ns.httpworm(server.hostname) } catch (e) {}
      try {ns.sqlinject(server.hostname) } catch (e) {}
      try {ns.nuke(server.hostname) } catch (e) {nuked = false}
      if(nuked){
        ns.toast("Nuked server: " + server.hostname, 'info');
      }
      return {hostname: server.hostname, nuked: nuked, new: nuked}
    })

    nukedServers = nukedServers.filter( value => value.nuked && value.new);
    if(nukedServers.length > 0){
      ns.toast("Nuked " + nukedServers.length + " new servers.");
      await ns.writePort(7, JSON.stringify({eventType: "nuked", eventData: 7}));
    }

    if(flags.loop) {
      await ns.sleep(100);
    }
  } while (flags.loop);
}