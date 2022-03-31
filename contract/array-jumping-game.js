const argsSchema = [
  ['value', '[]'],
]



/** @param {NS} ns **/
export async function main(ns) {
  let flags = ns.flags(argsSchema);

  let data = JSON.parse(flags['value']);
  let n = data.length
  let i = 0
  for (let reach = 0; i < n && i <= reach; ++i) {
    reach = Math.max(i + data[i], reach)
  }
  let solution = i === n
  let result = solution ? 1 : 0

  await ns.write('/temp/arrayjumpinggame.txt', result, 'w')
};