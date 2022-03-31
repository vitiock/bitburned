const argsSchema = [
  ['value', '["49442418",96]'],
]

/** @param {NS} ns **/
export async function main(ns) {
  let flags = ns.flags(argsSchema);
  let data = JSON.parse(flags['value']);
  let num = data[0]
  let target = data[1]

  function helper(res, path, num, target, pos, evaluated, multed) {
    if (pos === num.length) {
      if (target === evaluated) {
        res.push(path)
      }
      return
    }
    for (let i = pos; i < num.length; ++i) {
      if (i != pos && num[pos] == '0') {
        break
      }
      let cur = parseInt(num.substring(pos, i + 1))
      if (pos === 0) {
        helper(res, path + cur, num, target, i + 1, cur, cur)
      } else {
        helper(res, path + '+' + cur, num, target, i + 1, evaluated + cur, cur)
        helper(res, path + '-' + cur, num, target, i + 1, evaluated - cur, -cur)
        helper(res, path + '*' + cur, num, target, i + 1, evaluated - multed + multed * cur, multed * cur)
      }
    }
  }

  if (num == null || num.length === 0) {
    return []
  }
  var result = []
  helper(result, '', num, target, 0, 0, 0)
  ns.write('/temp/math.txt', JSON.stringify(result), 'w');
}