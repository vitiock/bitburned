const argsSchema = [
  ['value', '[]'],
]



/** @param {NS} ns **/
export async function main(ns) {
  let flags = ns.flags(argsSchema);

  let triangle = JSON.parse(flags['value']);

  const n = triangle.length;
  const result = triangle[n-1].slice();
  for (let i = n-2; i > -1; --i) {
    for (let j = 0; j < triangle[i].length; ++j) {
      result[j] = Math.min(result[j], result[j + 1]) + triangle[i][j];
    }
  }

  await ns.write('/temp/triangle.txt', result[0], 'w')
};