const stackTrace = require("stack-trace");
const fs = require("fs");
const _PATH = `${__dirname}/../../../docs/json`;
var _DATA = {};

let prepareLongString = str => {
  if (str.length > 100) return str.substr(0, 100) + "...";
  return str;
};

let prepareJson = obj => {
  const out = {};
  for (let i in obj) {
    switch (Object.prototype.toString.call(obj[i])) {
      case "[object Object]":
        out[i] = prepareJson(obj[i]);
        break;
      case "[object String]":
        out[i] = prepareLongString(obj[i]);
        break;
    }
  }
  return out;
};

let saveFile = (fileName, data) => {
  fs.writeFileSync(`${_PATH}/${fileName}`, JSON.stringify(data, null, 2));
};

module.exports = sendObj => {
  let reqData, resData;
  const trace = stackTrace
    .get()[1]
    .getFileName()
    .split("/");
  const fileName = trace[trace.length - 1] + "on";

  return sendObj
    .on("request", req => {
      reqData = {
        "http-headers": req.header,
        body: req["_data"]
      };
    })
    .on("response", res => {
      resData = {
        "http-headers": res.header,
        body: res.body
      };
      if (!_DATA[fileName]) _DATA[fileName] = { data: [] };
      _DATA[fileName].data.push({
        request: prepareJson(reqData),
        response: prepareJson(resData)
      });
      saveFile(fileName, _DATA[fileName]);
    });
};
