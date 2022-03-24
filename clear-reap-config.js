/** @param {NS} ns **/
export async function main(ns) {
  let files = ns.ls('home', '/reap/reap');
  files.map( file => ns.rm(file));
}