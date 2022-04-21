//let crimes = ['shoplift', 'rob store', 'mug', 'larceny', 'drugs', 'forge bond', 'traffic arms', 'homicide', 'grand auto', 'kidnap', 'assassin', 'heist']
let crimes = ['shoplift', 'mug', 'homicide']
const argsSchema = [
  ['duration', 60000*60],
]

/** @param {NS} ns **/
export async function main(ns) {
  let startTime = Date.now();
  let flags = ns.flags(argsSchema);
  while( true && Date.now() < startTime + flags['duration']) {
    let sleepTime = 900;
    if(!ns.isBusy()) {
      let profit = 0;
      let doCrime = 'shoplift';
      for (let crime of crimes) {
        let chance = ns.getCrimeChance(crime);
        let stats = ns.getCrimeStats(crime);
        let time = stats.time/1000;
        if (time > 60){
          continue;
        }
        ns.print(crime + " === " + ((stats.money/time)*chance))
        if( ((stats.money/time)*chance) > profit) {
          profit = ((stats.money/time)*chance);
          doCrime = crime;
        }
      }

      sleepTime = ns.commitCrime(doCrime);
      ns.print("Work type: " + ns.getPlayer().workType)
      ns.tail('crime.js');
    }
    await ns.sleep(sleepTime+100);
  }
}