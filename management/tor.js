/** @param {NS} ns **/

export async function main(ns) {
  while(!ns.scan('home').includes('darkweb')) {
    if(ns.getPlayer().money > 500000){
      ns.purchaseTor();
      ns.toast("Purchased TOR router", 'info', 10000)
    }

    await ns.sleep(60000);
  }
}