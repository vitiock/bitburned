/**
 *
 * @param {NS} ns
 */
export async function main(ns) {
  let augmentFiles = ns.ls('home', '/temp/augment')
  for(let i = 0; i < augmentFiles.length; i++){
    ns.tprintf(augmentFiles[i])
    ns.rm(augmentFiles[i])
  }
}