const argsSchema = [
  ['value', '[]'],
]



/** @param {NS} ns **/
export async function main(ns) {
  let flags = ns.flags(argsSchema);
  let data  = JSON.parse(flags['value']);

  let k = data[0]
  let prices = data[1]
  let len = prices.length
  if (len < 2) {
    return 0
  }
  if (k > len / 2) {
    let res = 0
    for (let i = 1; i < len; ++i) {
      res += Math.max(prices[i] - prices[i - 1], 0)
    }
    return res
  }
  let hold = []
  let rele = []
  hold.length = k + 1
  rele.length = k + 1
  for (let i = 0; i <= k; ++i) {
    hold[i] = Number.MIN_SAFE_INTEGER
    rele[i] = 0
  }
  let cur
  for (let i = 0; i < len; ++i) {
    cur = prices[i]
    for (var j = k; j > 0; --j) {
      rele[j] = Math.max(rele[j], hold[j] + cur)
      hold[j] = Math.max(hold[j], rele[j - 1] - cur)
    }
  }

  await ns.write('/temp/stock-trader-four.txt', rele[k], 'w');
}