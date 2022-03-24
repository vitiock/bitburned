/** @param {NS} ns **/
export async function main(ns) {
  let files = ns.ls('home', 'reap-lock');
  files.map( file => ns.rm(file));
}