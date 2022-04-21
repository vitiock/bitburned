/** @param {NS} ns **/
import {getAllServers} from "./helpers";

export async function main(ns) {
  let servers = getAllServers(ns)
  for(let server of servers) {
    if(ns.ls(server.hostname, "cct").length > 0) {
      let contracts = ns.ls(server.hostname, "cct");
      for(let i = 0; i < contracts.length; i++){
        //ns.toast("Attempting to solve \"" + ns.codingcontract.getContractType(contracts[i], server.hostname) + "\"", 'info', null)
        if(ns.codingcontract.getContractType(contracts[i], server.hostname) === "Unique Paths in a Grid I") {
          let contractPid = ns.exec('/contract/unique-paths-grid-one.js', 'home', 1, '--value', JSON.stringify(ns.codingcontract.getData(contracts[i], server.hostname)))
          while(ns.isRunning(contractPid, 'home')){
            await ns.sleep(10);
          }
          let result = ns.read('/temp/unique-paths-grid-one.txt')
          ns.tprint("Expected answer: " + result);
          ns.tprint("Attempts left: " + ns.codingcontract.getNumTriesRemaining(contracts[i], server.hostname));
          let contractType = ns.codingcontract.getContractType(contracts[i], server.hostname)
          let reward = ns.codingcontract.attempt(result, contracts[i], server.hostname, {returnReward: true})
          ns.toast(contractType + ": " + reward, 'info', null);
        } else if(ns.codingcontract.getContractType(contracts[i], server.hostname) === "Unique Paths in a Grid II") {
          let contractPid = ns.exec('/contract/unique-paths-grid-two.js', 'home', 1, '--value', JSON.stringify(ns.codingcontract.getData(contracts[i], server.hostname)))
          while(ns.isRunning(contractPid, 'home')){
            await ns.sleep(10);
          }
          let result = ns.read('/temp/unique-paths-grid-two.txt')
          ns.tprint("Expected answer: " + result);
          ns.tprint("Attempts left: " + ns.codingcontract.getNumTriesRemaining(contracts[i], server.hostname));
          ns.tprint("Expected answer: " + result);
          let contractType = ns.codingcontract.getContractType(contracts[i], server.hostname)
          let reward = ns.codingcontract.attempt(result, contracts[i], server.hostname, {returnReward: true})
          ns.toast(contractType + ": " + reward, 'info', null);
        } else if(ns.codingcontract.getContractType(contracts[i], server.hostname) === "Algorithmic Stock Trader I") {
          let contractPid = ns.exec('/contract/stock-trader-one.js', 'home', 1, '--value', JSON.stringify(ns.codingcontract.getData(contracts[i], server.hostname)))
          while(ns.isRunning(contractPid, 'home')){
            await ns.sleep(10);
          }
          let result = ns.read('/temp/stock-trader-one.txt')
          ns.tprint("Expected answer: " + result);
          let contractType = ns.codingcontract.getContractType(contracts[i], server.hostname)
          let reward = ns.codingcontract.attempt(result, contracts[i], server.hostname, {returnReward: true})
          ns.toast(contractType + ": " + reward, 'info', null);
        } else if(ns.codingcontract.getContractType(contracts[i], server.hostname) === "Algorithmic Stock Trader II") {
          let contractPid = ns.exec('/contract/stock-trader-two.js', 'home', 1, '--value', JSON.stringify(ns.codingcontract.getData(contracts[i], server.hostname)))
          while(ns.isRunning(contractPid, 'home')){
            await ns.sleep(10);
          }
          let result = ns.read('/temp/stock-trader-two.txt')
          let contractType = ns.codingcontract.getContractType(contracts[i], server.hostname)
          let reward = ns.codingcontract.attempt(result, contracts[i], server.hostname, {returnReward: true})
          ns.toast(contractType + ": " + reward, 'info', null);
        } else if(ns.codingcontract.getContractType(contracts[i], server.hostname) === "Algorithmic Stock Trader III") {
          let contractPid = ns.exec('/contract/stock-trader-three.js', 'home', 1, '--value', JSON.stringify(ns.codingcontract.getData(contracts[i], server.hostname)))
          while(ns.isRunning(contractPid, 'home')){
            await ns.sleep(10);
          }
          let result = ns.read('/temp/stock-trader-three.txt')
          ns.tprint("Expected answer: " + result);
          let contractType = ns.codingcontract.getContractType(contracts[i], server.hostname)
          let reward = ns.codingcontract.attempt(result, contracts[i], server.hostname, {returnReward: true})
          ns.toast(contractType + ": " + reward, 'info', null);
        } else if(ns.codingcontract.getContractType(contracts[i], server.hostname) === "Algorithmic Stock Trader IV") {
          let contractPid = ns.exec('/contract/stock-trader-four.js', 'home', 1, '--value', JSON.stringify(ns.codingcontract.getData(contracts[i], server.hostname)))
          while (ns.isRunning(contractPid, 'home')) {
            await ns.sleep(10);
          }
          let result = ns.read('/temp/stock-trader-four.txt')
          ns.tprint("Expected answer: " + result);
          let contractType = ns.codingcontract.getContractType(contracts[i], server.hostname)
          let reward = ns.codingcontract.attempt(result, contracts[i], server.hostname, {returnReward: true})
          ns.toast(contractType + ": " + reward, 'info', null);
        } else if(ns.codingcontract.getContractType(contracts[i], server.hostname) === "Find Largest Prime Factor") {
          /*let contractPid = ns.exec('/contract/prime-factorization.js', 'home', 1, '--value', ns.codingcontract.getData(contracts[i], server.hostname))
          while(ns.isRunning(contractPid, 'home')){
            await ns.sleep(10);
          }
          let result = ns.read('/temp/factorization.txt')
          ns.tprint("Expected result: " + result);
          ns.tprint("Expected answer: " + result);
          let contractType = ns.codingcontract.getContractType(contracts[i], server.hostname)
          let reward = ns.codingcontract.attempt(result, contracts[i], server.hostname, {returnReward: true})
          ns.toast(contractType + ": " + reward, 'info', null);*/
        } else if(ns.codingcontract.getContractType(contracts[i], server.hostname) === "Sanitize Parentheses in Expression") {
          let contractPid = ns.exec('/contract/parens.js', 'home', 1, '--value', ns.codingcontract.getData(contracts[i], server.hostname))
          while(ns.isRunning(contractPid, 'home')){
            await ns.sleep(10);
          }
          let result = JSON.parse(ns.read('/temp/parens.txt'));
          ns.tprint( "Expected Answer: " + JSON.stringify(result));
          ns.tprint("Expected answer: " + result);
          let contractType = ns.codingcontract.getContractType(contracts[i], server.hostname)
          let reward = ns.codingcontract.attempt(result, contracts[i], server.hostname, {returnReward: true})
          ns.toast(contractType + ": " + reward, 'info', null);
        } else if(ns.codingcontract.getContractType(contracts[i], server.hostname) === "Spiralize Matrix") {
          let contractPid = ns.exec('/contract/spiral.js', 'home', 1, '--value', JSON.stringify(ns.codingcontract.getData(contracts[i], server.hostname)))
          while(ns.isRunning(contractPid, 'home')){
            await ns.sleep(10);
          }
          let result = JSON.parse(ns.read('/temp/spiral.txt'));
          ns.tprint("Expected answer: " + result);
          let contractType = ns.codingcontract.getContractType(contracts[i], server.hostname)
          let reward = ns.codingcontract.attempt(result, contracts[i], server.hostname, {returnReward: true})
          ns.toast(contractType + ": " + reward, 'info', null);
        } else if(ns.codingcontract.getContractType(contracts[i], server.hostname) === "Minimum Path Sum in a Triangle") {
          let contractPid = ns.exec('/contract/triangle.js', 'home', 1, '--value', JSON.stringify(ns.codingcontract.getData(contracts[i], server.hostname)))
          while(ns.isRunning(contractPid, 'home')){
            await ns.sleep(10);
          }
          let result = ns.read('/temp/triangle.txt');
          ns.tprint("Expected answer: " + result);
          let contractType = ns.codingcontract.getContractType(contracts[i], server.hostname)
          let reward = ns.codingcontract.attempt(result, contracts[i], server.hostname, {returnReward: true})
          ns.toast(contractType + ": " + reward, 'info', null);
        } else if(ns.codingcontract.getContractType(contracts[i], server.hostname) === "Find All Valid Math Expressions") {
          let contractPid = ns.exec('/contract/math.js', 'home', 1, '--value', JSON.stringify(ns.codingcontract.getData(contracts[i], server.hostname)))
          while(ns.isRunning(contractPid, 'home')){
            await ns.sleep(10);
          }
          let result = ns.read('/temp/math.txt');
          ns.tprint("Expected answer: " + result);
          let contractType = ns.codingcontract.getContractType(contracts[i], server.hostname)
          let reward = ns.codingcontract.attempt(result, contracts[i], server.hostname, {returnReward: true})
          ns.toast(contractType + ": " + reward, 'info', null);
        } else if(ns.codingcontract.getContractType(contracts[i], server.hostname) === "Subarray with Maximum Sum") {
          let contractPid = ns.exec('/contract/sub-array.js', 'home', 1, '--value', JSON.stringify(ns.codingcontract.getData(contracts[i], server.hostname)))
          while(ns.isRunning(contractPid, 'home')){
            await ns.sleep(10);
          }
          let result = ns.read('/temp/subarray.txt');
          ns.tprint("Expected answer: " + result);
          let contractType = ns.codingcontract.getContractType(contracts[i], server.hostname)
          let reward = ns.codingcontract.attempt(result, contracts[i], server.hostname, {returnReward: true})
          ns.toast(contractType + ": " + reward, 'info', null);
        } else if(ns.codingcontract.getContractType(contracts[i], server.hostname) === "Total Ways to Sum") {
          let contractPid = ns.exec('/contract/waystosum.js', 'home', 1, '--value', JSON.stringify(ns.codingcontract.getData(contracts[i], server.hostname)))
          while(ns.isRunning(contractPid, 'home')){
            await ns.sleep(10);
          }
          let result = ns.read('/temp/waystosum.txt');
          ns.tprint("Expected answer: " + result);
          let contractType = ns.codingcontract.getContractType(contracts[i], server.hostname)
          let reward = ns.codingcontract.attempt(result, contracts[i], server.hostname, {returnReward: true})
          ns.toast(contractType + ": " + reward, 'info', null);
        } else if(ns.codingcontract.getContractType(contracts[i], server.hostname) === "Array Jumping Game") {
          let contractPid = ns.exec('/contract/array-jumping-game.js', 'home', 1, '--value', JSON.stringify(ns.codingcontract.getData(contracts[i], server.hostname)))
          while(ns.isRunning(contractPid, 'home')){
            await ns.sleep(10);
          }
          let result = ns.read('/temp/arrayjumpinggame.txt');
          ns.tprint("Expected answer: " + result);
          let contractType = ns.codingcontract.getContractType(contracts[i], server.hostname)
          let reward = ns.codingcontract.attempt(result, contracts[i], server.hostname, {returnReward: true})
          ns.toast(contractType + ": " + reward, 'info', null);
        } else if(ns.codingcontract.getContractType(contracts[i], server.hostname) === "Generate IP Addresses") {
          let contractPid = ns.exec('/contract/ip.js', 'home', 1, '--value', ns.codingcontract.getData(contracts[i], server.hostname))
          while(ns.isRunning(contractPid, 'home')){
            await ns.sleep(10);
          }
          let result = ns.read('/temp/ip.txt');
          ns.tprint("Expected answer: " + result);
          let contractType = ns.codingcontract.getContractType(contracts[i], server.hostname)
          let reward = ns.codingcontract.attempt(result, contracts[i], server.hostname, {returnReward: true})
          ns.toast(contractType + ": " + reward, 'info', null);
        } else if(ns.codingcontract.getContractType(contracts[i], server.hostname) === "Merge Overlapping Intervals") {
          let contractPid = ns.exec('/contract/merge-overlapping.js', 'home', 1, '--value', JSON.stringify(ns.codingcontract.getData(contracts[i], server.hostname)))
          while(ns.isRunning(contractPid, 'home')){
            await ns.sleep(10);
          }
          let result = ns.read('/temp/overlapping.txt');
          ns.tprint("Expected answer: " + result);
          let contractType = ns.codingcontract.getContractType(contracts[i], server.hostname)
          let reward = ns.codingcontract.attempt(result, contracts[i], server.hostname, {returnReward: true})
          ns.toast(contractType + ": " + reward, 'info', null);
        } else if (ns.codingcontract.getContractType(contracts[i], server.hostname) === "Shortest Path in a Grid") {

        } else if (ns.codingcontract.getContractType(contracts[i], server.hostname) === "Array Jumping Game II") {

        }else if (ns.codingcontract.getContractType(contracts[i], server.hostname) === "Total Ways to Sum II") {

        }else if (ns.codingcontract.getContractType(contracts[i], server.hostname) === "HammingCodes: Encoded Binary to Integer") {

        }else if (ns.codingcontract.getContractType(contracts[i], server.hostname) === "HammingCodes: Integer to encoded Binary") {

        }else {
          ns.toast("No solver for \"" + ns.codingcontract.getContractType(contracts[i], server.hostname) + "\"", 'error')
        }
      }
    }
  }
}