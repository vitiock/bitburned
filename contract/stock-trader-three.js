const argsSchema = [
  ['value', '[]'],
]



/** @param {NS} ns **/
export async function main(ns) {
  let flags = ns.flags(argsSchema);
  let stockValues = JSON.parse(flags['value']);

  let buy1 = Number.MAX_SAFE_INTEGER;
  let buy2 = Number.MIN_SAFE_INTEGER;
  let sell1 = 0;
  let sell2 = 0;
  for (let value of stockValues) {
    buy1 = Math.min(buy1, value);           // min first buy price
    sell1 = Math.max(sell1, value - buy1);      // max first sell profit
    buy2 = Math.max(buy2, sell1 - value);      // max second buy profit
    sell2 = Math.max(sell2, buy2 + value);      // max second sell profit
  }

  await ns.write('/temp/stock-trader-three.txt', sell2, 'w');
}