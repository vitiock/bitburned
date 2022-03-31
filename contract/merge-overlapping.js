const argsSchema = [
  ['value', '[[1, 3], [8, 10], [2, 6], [10, 16]]'],
]



/** @param {NS} ns **/
export async function main(ns) {
  let flags = ns.flags(argsSchema);

  let data = JSON.parse(flags['value']);

  let intervals = data.slice()
  intervals.sort(function (a, b) {
    return a[0] - b[0]
  })
  let result = []
  let start = intervals[0][0]
  let end = intervals[0][1]
  for (let _i = 0, intervals_1 = intervals; _i < intervals_1.length; _i++) {
    let interval = intervals_1[_i]
    if (interval[0] <= end) {
      end = Math.max(end, interval[1])
    } else {
      result.push([start, end])
      start = interval[0]
      end = interval[1]
    }
  }
  result.push([start, end])

  await ns.write('/temp/overlapping.txt', JSON.stringify(result), 'w')
};