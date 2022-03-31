const argsSchema = [
  ['value', '(()aa(()))))a(()()))'],
]

function isValid(ns, input) {
  let start = 0;
  let lastbalance = 0;
  let createNewString = false;
  let substrings = [];


  let currentParens = 0;
  for( let char in input) {
    let character = input[char];
    if(character === '(') {
      if(createNewString) {
        substrings.push({parenChunk: input.substr(start, char-start), removeOpens: 0, removeCloses: -currentParens});
        currentParens = 1;
        start = char;
        createNewString = false;
      } else {
        currentParens += 1;
      }
    } else if (character === ')') {
      currentParens -= 1;
    }

    if (currentParens === 0){
      createNewString = true;
    }

    if (currentParens < 0) {
      createNewString = true;
    }
  }

  if(currentParens > 0) {
    substrings.push({parenChunk: input.substr(start, input.length-start), removeOpens: currentParens, removeCloses: 0});
  } else {
    substrings.push({parenChunk: input.substr(start, input.length-start), removeOpens: 0, removeCloses: -currentParens});
  }
  return substrings;
}

function tokenizeCloseParens(ns, parenString) {
  let tokens = [];
  let currentString = ''
  currentString = currentString + parenString[0]
  let isCloseToken = false;
  if(parenString[0] === ')'){
    isCloseToken = true;
  }
 for(let i = 1; i < parenString.length; i++){
   if(isCloseToken && parenString[i] === ')'){
     currentString = currentString + parenString[i];
   } else if (isCloseToken && parenString[i] !== ')'){
     tokens.push({text: currentString, isCloseToken: true});
     currentString = parenString[i];
     isCloseToken = false;
   } else if (!isCloseToken && parenString[i] === ')'){
     tokens.push({text: currentString, isCloseToken: false});
     currentString = parenString[i];
     isCloseToken = true;
   } else {
     currentString = currentString + parenString[i]
   }
 }
 tokens.push({text: currentString, isCloseToken: isCloseToken});

 return tokens;
}

function assembleCloseParenChunks(ns, tokens, numberToRemove) {
  let chunkPermutations = [];

  if(tokens.length === 0){
    if(numberToRemove === 0){
      return [''];
    } else {
      return [];
    }
  }


    let token = tokens[0]
    if(token.isCloseToken) {
      for( let x = 0; x <= numberToRemove && x <= token.text.length; x++){
        let newString = token.text.substr(0, token.text.length-x);
        let possiblePermutations = assembleCloseParenChunks(ns, tokens.slice(1, tokens.length), numberToRemove-x);
        for(let y = 0; y < possiblePermutations.length; y++){
          chunkPermutations.push(newString + possiblePermutations[y])
        }
      }
    } else {
      let possiblePermutations = assembleCloseParenChunks(ns, tokens.slice(1, tokens.length), numberToRemove);
      for(let y = 0; y < possiblePermutations.length; y++) {
        chunkPermutations.push(token.text + possiblePermutations[y]);
      }
    }

  return chunkPermutations;
}

function removeCloseParen(ns, parenString, numberToRemove) {
  let tokens = tokenizeCloseParens(ns, parenString);
  let permutations = assembleCloseParenChunks(ns, tokens, numberToRemove);
  return permutations;
}

function removeOpenParen(ns, chunk, numRemove) {
  if(chunk === null || chunk.length === 0){
    if(numRemove === 0) {
      return ['']
    } else {
      return []
    }
  }

  let perms = [];

    if(chunk[0] === "(" && numRemove > 0){
      let removePerms = removeOpenParen(ns, chunk.substr(1), numRemove-1)
      for(let x = 0; x < removePerms.length; x++){
        perms.push(removePerms[x])
      }
      let noRemovePerms = removeOpenParen(ns, chunk.substr(1), numRemove)
      for(let y=0; y< noRemovePerms.length; y++){
        perms.push("(" + noRemovePerms[y]);
      }
    } else {
      let noRemovePerms = removeOpenParen(ns, chunk.substr(1), numRemove)
      for(let y=0; y< noRemovePerms.length; y++){
        perms.push(chunk[0] + noRemovePerms[y]);
      }
    }

  return perms;
}

function assembleChunks(ns, chunks){
  let permutations = [];
  if(chunks.length === 0){
    return [''];
  }
  let perms = assembleChunks(ns, chunks.slice(1, chunks.length))
  for(let i = 0; i < chunks[0].length; i++){
    for(let x = 0; x < perms.length; x++){
      permutations.push(chunks[0][i] + perms[x]);
    }
  }
  const unique = [...new Set(permutations)];
  return unique
}

function isValidParens(token) {
  let parens = 0;
  for(let i = 0; i < token.length; i++){
    if(token[i] === '('){
      parens += 1;
    }
    if(token[i] === ')'){
      parens -= 1;
      if(parens < 0) {
        return false;
      }
    }
  }
  return parens === 0;
}

function brute(chunk){
  if(chunk === null || chunk.length === 0){
    return ['']
  }

  let perms = [];

  if(chunk[0] === "(" || chunk[0] === ')'){
    let removePerms = brute(chunk.substr(1))
    for(let x = 0; x < removePerms.length; x++){
      perms.push(removePerms[x])
    }
    let noRemovePerms = brute(chunk.substr(1))
    for(let y=0; y< noRemovePerms.length; y++){
      perms.push(chunk[0] + noRemovePerms[y]);
    }
  } else {
    let noRemovePerms = brute(chunk.substr(1))
    for(let y=0; y< noRemovePerms.length; y++){
      perms.push(chunk[0] + noRemovePerms[y]);
    }
  }

  return perms;
}

/** @param {NS} ns **/
export async function main(ns) {
  let flags = ns.flags(argsSchema);

  let parenString = flags['value'];
  let perms = brute(parenString);
  const unique = [...new Set(perms)];
  let valid = unique.filter(answer => isValidParens(answer));
  let maxLength = 0;
  for(let i = 0; i < valid.length; i++){
    if(valid[i].length > maxLength){
      maxLength = valid[i].length
    }
  }
  let answer = valid.filter( answer => answer.length === maxLength);
  await ns.write("/temp/parens.txt", JSON.stringify(answer, null, 2), 'w');
}