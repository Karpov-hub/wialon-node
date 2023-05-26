var fs = require("fs");
var rd = function(p) {
  files = fs.readdirSync(p);
  files.forEach(file => {
    if (fs.lstatSync(p + "/" + file).isDirectory()) rd(p + "/" + file);
    else {
      var content1 = fs.readFileSync(p + "/" + file);
      var content2 = prep(content1);
      if (content1.length != content2.length) {
        fs.writeFileSync(p + "/" + file, content2);
        console.log("prepared:", p + "/" + file);
      }
    }
  });
};

var prep = function(s) {
  var c,
    j,
    l,
    i = 0,
    out = "";

  s = s.toString();

  while (i < s.length) {
    if (s.substr(i, 15) == "// scope:" + process.argv[3]) {
      j = out.length - 1;
      while (j >= 0 && out.charAt(j) != "\n") j--;
      if (j >= 0) out = out.substr(0, j + 1);
      else out = "";
      i += 15;
    } else if (s.substr(i, 18) == "/* scope:" + process.argv[3] + " */") {
      i += 18;
      while (i < s.length && (c = s.charAt(i)) != "{") i++;
      l = 1;
      i++;
      while (i < s.length) {
        c = s.charAt(i);
        if (c == "{") l++;
        else if (c == "}") {
          l--;
          if (!l) break;
        } else if (c == "\n") out += "\n";
        i++;
      }
      i++;
      if (s.charAt(i) == ",") i++;
    } else out += s.charAt(i++);
  }
  return out;
};

rd(process.argv[2]);
