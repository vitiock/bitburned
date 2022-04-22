/**
 *
 * @param {NS} ns
 */
export async function main(ns) {

  let serversToScan = [];
  let scanned = [];
  let children = {};
  let parent = {};
  serversToScan.push('home');

  //Collect all server hostnames into scanned
  while(serversToScan.length > 0){
    let host = serversToScan.pop();
    if(scanned.includes(host)){
      continue;
    }
    scanned.push(host);
    let scan = ns.scan(host);
    children[host] = scan;
    for(let hostname of scan){
      if(!scanned.includes(hostname)) {
        parent[hostname] = host
      }
      serversToScan.push(hostname);
    }
  }

  let expanded = scanned.map( hostname => {
    let server = ns.getServer(hostname)
    server.neighbors = children[hostname]
    server.httpPortOpen = undefined;
    server.isConnectedTo = undefined;
    server.ramUsed = undefined;
    server.smtpPortOpen = undefined;
    server.sqlPortOpen = undefined;
    server.parent = parent[hostname]
    return server;
  });

  await ns.write('/temp/servers.txt', JSON.stringify(expanded, null, 2), 'w');
}