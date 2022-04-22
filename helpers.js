
//TODO - convert this into a server -> symbol map to be used with stock manipulation
export const SYMBOL_MAP = [
  ["AERO","AeroCorp","aerocorp"],
  ["APHE","Alpha Enterprises","alpha-ent"],
  ["BLD","Blade Industries","blade"],
  ["CLRK","Clarke Incorporated","clarkinc"],
  ["CTK","CompuTek","comptek"],
  ["CTYS","Catalyst Ventures","catalyst"],
  ["DCOMM","DefComm","defcomm"],
  ["ECP","ECorp","ecorp"],
  ["FLCM","Fulcrum Technologies","fulcrumassets"],
  ["FNS","FoodNStuff","foodnstuff"],
  ["FSIG","Four Sigma","4sigma"],
  ["GPH","Global Pharmaceuticals","global-pharm"],
  ["HLS","Helios Labs","helios"],
  ["ICRS","Icarus Microsystems","icarus"],
  ["JGN","Joe's Guns","joesguns"],
  ["KGI","KuaiGong International","kuai-gong"],
  ["LXO","LexoCorp","lexo-corp"],
  ["MDYN","Microdyne Technologies","microdyne"],
  ["MGCP","MegaCorp","megacorp"],
  ["NTLK","NetLink Technologies","netlink"],
  ["NVMD","Nova Medical","nova-med"],
  ["OMGA","Omega Software","omega-net"],
  ["OMN","Omnia Cybersystems","omnia"],
  ["OMTK","OmniTek Incorporated","omnitek"],
  ["RHOC","Rho Contruction","rho-construction"],
  ["SGC","Sigma Cosmetics","sigma-cosmetics"],
  ["SLRS","Solaris Space Systems","solaris"],
  ["STM","Storm Technologies","stormtech"],
  ["SYSC","SysCore Securities","syscore"],
  ["TITN","Titan Laboratories","titan-labs"],
  ["UNV","Universal Energy","univ-energy"],
  ["VITA","VitaLife","vitalife"],
  ["WDS","Watchdog Security",""]
];

/** @param {NS} ns
 * @returns {Server[]}
 * **/
export function getOwnedServers(ns) {
  let targets = ['home']
  let scanned = []
  let hostList = []

  while (targets.length > 0) {
    let name = targets.pop();
    scanned.push(name);

    let server = ns.getServer(name);
    if (server.hasAdminRights && !server.hostname.startsWith('hacknet')) {
      hostList.push(server);
      let hosts = ns.scan(name);
      for (let i = 0; i < hosts.length; i++) {
        if (!scanned.includes(hosts[i])) {
          targets.push(hosts[i]);
        }
      }
    }
  }

  return hostList;
}

/** @param {NS} ns
 * @returns {Server[]}
 * **/
export function getAllServers(ns) {
  let targets = ['home']
  let scanned = []
  let hostList = []

  while (targets.length > 0) {
    let name = targets.pop();
    scanned.push(name);

    let server = ns.getServer(name);
      hostList.push(server);
      let hosts = ns.scan(name);
      for (let i = 0; i < hosts.length; i++) {
        if (!scanned.includes(hosts[i])) {
          targets.push(hosts[i]);
        }
      }
  }

  return hostList;
}


/**
 *
 * @param {number} num number to format
 * @param {number} digits number of digits past the decimal place
 * @returns {string|string}
 */
export function nFormatter(num, digits) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" }
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup.slice().reverse().find(function(item) {
    return num >= item.value;
  });
  return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}

/**
 *
 * @param {number} num number to format
 * @param {number} digits number of digits past the decimal place
 * @returns {string|string}
 */
export function formatMoney(num, digits) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "K" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "B" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" }
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup.slice().reverse().find(function(item) {
    return num >= item.value;
  });
  return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}

/**
 *
 * @param {Server} server
 */
export function getFreeRam(server) {
  if (server.hostname === 'home') {
    return server.maxRam - server.ramUsed - 500;
  }
  return server.maxRam - server.ramUsed;
}

/**
 *
 * @param {NS} ns
 * @param {string[]} hostnames
 * @returns {Server[]}
 */
export function expandHostnames(ns, hostnames) {
  let servers = [];
  hostnames.map( (hostname) => {
    servers.push(ns.getServer(hostname));
  })

  return servers;
}

/**
 *
 * @param {NS} ns
 * @param {string} scriptName
 * @param {string} host
 * @param {Array<string | number | boolean>} args
 */
export async function executeAndWait(ns, scriptName, host, ...args) {
  let pid = ns.exec(scriptName, host, 1, ...args)
  let itters = 0;
  while (pid === 0) {
    itters++
    await ns.sleep(10);
    pid = ns.exec(scriptName, host)

    if (itters === 100 && pid === 0) {
      throw("Failed to initialize Script: " + scriptName + " on Host: " + host + " after " + itters + " tries.");
    }
  }

  while (ns.isRunning(pid, host)) {
    await ns.sleep(100);
  }
}

export function loadCycleConfig(ns) {
  return JSON.parse(ns.read('/temp/cycle-config.txt'));
}

/**
 *
 * @param {NS} ns
 * @returns {CycleState}
 */
export function loadCycleState(ns) {
  return JSON.parse(ns.read('/temp/cycle-state.txt'));
}

export async function generateFactionData(ns, host) {
  await executeAndWait(ns, '/data/generate-current-factions.js', host);
  await executeAndWait(ns, '/data/generate-current-faction-rep.js', host);
  await executeAndWait(ns, '/data/generate-current-faction-favor.js', host);
  await executeAndWait(ns, '/data/generate-current-faction-favor-gained.js', host);
}

export async function generateAugmentData(ns, augmentName, ...args) {
  executeAndWait(ns, '/data/augment-static-data.js', 'host', ...args)
}

/**
 * @param {string} value
 * @returns {string}
 **/
export function fixWidthString(value, desiredLength) {
  let newValue = value.substr(0, desiredLength)
  newValue = newValue.padEnd(desiredLength, ' ')
  return newValue
}

/**
 *
 * @param ns
 * @returns {Server[]}
 */
export function getServers(ns) {
  return JSON.parse(ns.read('/temp/servers.txt'))
}