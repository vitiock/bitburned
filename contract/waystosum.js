const argsSchema = [
  ['value', 79],
]

/** @param {NS} ns **/
export async function main(ns) {
  let flags = ns.flags(argsSchema);

  let data = flags['value'];

  let ways = [1]
  ways.length = data + 1
  ways.fill(0, 1)
  for (let i = 1; i < data; ++i) {
    for (let j = i; j <= data; ++j) {
      ways[j] += ways[j - i]
    }
  }

  await ns.write('/temp/waystosum.txt', ways[data], 'w')
};