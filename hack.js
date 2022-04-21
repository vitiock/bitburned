export async function main(ns) {
  while(true) {
    let server = await ns.getServer(ns.args[0]);
    if (server.hackDifficulty > server.minDifficulty + .25) {
      //ns.print("Hack Min: " + server.minDifficulty + ", Current: " + server.hackDifficulty)
      await ns.weaken(ns.args[0])
    } else
    if (server.moneyAvailable < server.moneyMax * .95) {
      //ns.print("Moneys Max: " + server.moneyMax + ", Current: " + server.moneyAvailable)
      await ns.grow(ns.args[0])
    } else
    {
      let hackMade = await ns.hack(ns.args[0])
      ns.toast("Hacked " + ns.args[0] + " for " + hackMade);
    }
  }
}