/** @param {NS} ns **/
export async function main(ns) {
  ns.tprint("Preparing lite bootstrap");

  let player = ns.getPlayer();
  if(player.bitNodeN === 9){
    ns.tprint("We are currently in bitnode 9");
  }
  ns.tprint("Generating cycle config");
  ns.run('/data/generate-cycle-config.js')

  ns.tprint("Starting hacking manager.");
  ns.run('test-targeting.js');
}