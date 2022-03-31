const argsSchema = [
  ['value', 485976180],
]

/** @param {NS} ns **/
export async function main(ns) {
  let flags = ns.flags(argsSchema);

  let value = flags['value'];


  let primeObject = JSON.parse(ns.read('/static-data/primes.txt'))

  let primes = [];
  for(let i = 0; i <= 999999; i++){
    primes.push(primeObject[i])
  }

  await ns.write("/static-data/prime.txt", JSON.stringify(primes), 'w');

  let contains = function (arr, x, start, end) {
    if (start > end) return false;
    let mid=Math.floor((start + end)/2);
    if (arr[mid]===x) return true;
    if(arr[mid] > x)
      return contains(arr, x, start, mid-1);
    else
      return contains(arr, x, mid+1, end);
  }

  //primeObject.map( value => primes.push(value));
  let remainder = value;
  let largest = 1;
  let i = 0;

  while(!contains(primes, remainder, 0, primes.length)) {
    while(primes[i] < remainder) {
      if (remainder % primes[i] === 0) {
        if (primes[i] > largest) {
          largest = primes[i]
        }
        remainder = remainder / primes[i];
        i = -1;
      }
      i++;
    }
  }
  if(remainder > largest) {
    largest = remainder;
  }

  await ns.write('/temp/factorization.txt', largest, 'w');
}