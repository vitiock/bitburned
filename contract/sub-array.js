const argsSchema = [
  ['value', '[]'],
]



/** @param {NS} ns **/
export async function main(ns) {
  let flags = ns.flags(argsSchema);

  let data = JSON.parse(flags['value']);

  const nums = data.slice();
  for (let i = 1; i < nums.length; i++) {
    nums[i] = Math.max(nums[i], nums[i] + nums[i - 1]);
  }

  await ns.write('/temp/subarray.txt', Math.max(...nums), 'w')
};