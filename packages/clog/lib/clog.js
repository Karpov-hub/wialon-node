"use strict";

const config = require("@lib/config");
const fs = require('fs');

function isFileExists(path) {
  return new Promise(res => {
    fs.access(path, fs.F_OK, (err) => {
      if (err) {
        return res(false);
      }
      res(true);
    })
  })
}

async function checkStatus() {
  if(!config.CLOG) return false;
  return await isFileExists(config.CLOG);
  
}

module.exports = {
  async log(descript, data) {
    const status = await checkStatus();
    if(status) {
      console.log("CLOG (",new Date(),"):", descript? descript + ";":"", data || "") 
    }    	
  }
}
