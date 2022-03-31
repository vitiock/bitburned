
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
    if (server.hasAdminRights) {
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
    return server.maxRam - server.ramUsed - 32;
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