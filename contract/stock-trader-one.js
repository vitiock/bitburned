const argsSchema = [
  ['value', '[]'],
]



/** @param {NS} ns **/
export async function main(ns) {
  let flags = ns.flags(argsSchema);
  let stockValues = JSON.parse(flags['value']);
  let largestGain = 0;
  for(let i = 0; i < stockValues.length; i++){
    for(let x = i+1; x < stockValues.length; x++){
      if(stockValues[x]-stockValues[i] > largestGain){
        largestGain = stockValues[x]-stockValues[i]
      }
    }
  }

  await ns.write('/temp/stock-trader-one.txt', largestGain, 'w');
}