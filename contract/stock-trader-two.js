const argsSchema = [
  ['value', '[]'],
]



/** @param {NS} ns **/
export async function main(ns) {
  let flags = ns.flags(argsSchema);
  let stockValues = JSON.parse(flags['value']);
  let largestGain = 0;
  for (let i = 1; i < stockValues.length; i++) {
    largestGain += Math.max(stockValues[i] - stockValues[i - 1], 0);
  }

  await ns.write('/temp/stock-trader-two.txt', largestGain, 'w');
}