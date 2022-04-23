const path = require('path');
const fs = require('fs');
const http = require('http');

let processDirectory = (directoryPath, parts = []) => {
  fs.readdir(directoryPath, function(err, files) {
    files.forEach(function (file) {
      let newPath = path.join(directoryPath, file)
      if(fs.lstatSync(newPath).isDirectory()){
        let newParts = parts.map(part => part);
        newParts.push(file)
        processDirectory(newPath, newParts)
      } else {
        //console.log("Path: " + JSON.stringify(parts));
        let newParts = parts.map(part => part);
        newParts.push(file)
        let filename = newParts.join('/');
        //console.log("Destination: " + filename)
        //console.log("File: " + newPath)
        const content = fs.readFileSync(newPath);
        let buff = new Buffer(content);
        let base64 = buff.toString('base64');
        //console.log("Base64: " + base64)

        let postOptions = {
          host: 'localhost',
          port: '9990',
          method: 'PUT',
          headers: {
            Authorization: '<INSERT API KEY HERE>'
          }
        }

        let postData = {
          filename: filename,
          code: base64
        }

        const req = http.request(postOptions, res => {
          console.log(`statusCode: ${res.statusCode}`)

          res.on('data', d => {
            console.log(d);
          })
        })

        req.on('error', error => {
          console.error(error);
        })

        req.write(JSON.stringify(postData));
        req.end()
      }

    })
  })
}

const directoryPath = path.join(__dirname, '..\\build');
processDirectory(directoryPath);