let crimes = ['shoplift', 'rob store', 'mug', 'larceny', 'drugs', 'forge bond', 'traffic arms', 'homicide', 'grand auto', 'kidnap', 'assassin', 'heist']

/** @param {NS} ns **/
export async function main(ns) {
  while( true ) {
    let sleepTime = 900;
    if(!ns.isBusy()) {
      let profit = 0;
      let doCrime = 'shoplift';
      crimes.map(crime => {
        let chance = ns.getCrimeChance(crime);
        let stats = ns.getCrimeStats(crime);
        let time = stats.time/1000;
        if( ((stats.money/time)*chance) > profit) {
          profit = ((stats.money/time)*chance);
          doCrime = crime;
        }
      })

      sleepTime = ns.commitCrime(doCrime);
      ns.tail('crime.js');
    }
    await ns.sleep(sleepTime+100);
  }
}