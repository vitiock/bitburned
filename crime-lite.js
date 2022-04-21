let crimes = ['shoplift', 'rob store', 'mug', 'larceny', 'drugs', 'forge bond', 'traffic arms', 'homicide', 'grand auto', 'kidnap', 'assassin', 'heist']

const argsSchema = [
  ['duration', 60000],
  ['crime', 'shoplift']
]

/** @param {NS} ns **/
export async function main(ns) {
  let flags = ns.flags(argsSchema);
  ns.tail();

  while( true ) {
    let sleepTime = 990;
    if(!ns.isBusy()) {
      sleepTime = ns.commitCrime(flags['crime']);
      ns.print("Work type: " + ns.getPlayer().workType)
      ns.tail('crime-lite.js');
      if(ns.args.length > 0) {
        ns.tail('crime-lite.js', ns.getHostname(), '--crime', flags['crime']);
      }
    }
    await ns.sleep(sleepTime+10);
  }
}