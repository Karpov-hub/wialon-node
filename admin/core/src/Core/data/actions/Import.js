Ext.define("Core.data.actions.Import", {
  $importDataFromFile: function(data, callback) {
    var me = this;
    me.getPermissions(
      function(permis) {
        if (permis.add || permis.modify)
          if (data.clear) {
            me.importDataClear(function() {
              me.importDataFromFile(data, callback);
            });
          } else me.importDataFromFile(data, callback);
        else {
          me.error(401);
        }
      },
      null,
      data
    );
  },

  importDataFromFile: function(data, cb) {
    if (data.fileName.substr(-3).toLowerCase() === "xml")
      this.importDataFromFileXml(data, cb);
    else this.importDataFromFileCsv(data, cb);
  },

  importDataFromFileCsv: function(data, callback) {
    var me = this,
      count = 0,
      LineByLineReader = require("line-by-line"),
      fn = __dirname + "/../../../static/tmp/" + data.tmpName,
      lr = new LineByLineReader(fn);

    var cb = function() {
      me.changeModelData(Object.getPrototypeOf(me).$className, "ins", {});
      require("fs").unlink(fn, function() {});
      callback({ count: count });
    };

    lr.on("error", function(err) {
      cb();
    });
    lr.on("line", function(line) {
      lr.pause();
      me.importDataLine(line, function(res) {
        if (res !== false) count++;
        lr.resume();
      });
    });
    lr.on("end", function() {
      if (!!me.importDataEnd) me.importDataEnd(cb);
      else cb();
    });
  },

  importDataFromFileXml: function(data, callback) {
    var me = this,
      count = 0,
      bigXml = require("big-xml-streamer"),
      fn = __dirname + "/../../../static/tmp/" + data.tmpName,
      reader = bigXml.createReader(
        fn,
        new RegExp("^(" + me.importXmlTag + ")$"),
        { gzip: false }
      );
    var cb = function() {
      callback({ count: count });
    };
    me.noChangeModel = true;
    reader.on("error", function(err) {
      cb();
    });
    reader.on("record", function(item, next) {
      reader.pause();
      me.importDataItem(item, function() {
        count++;
        reader.resume();
      });
    });
    reader.on("end", function() {
      me.noChangeModel = false;
      me.changeModelData(Object.getPrototypeOf(me).$className, "ins", {});
      cb();
    });
  },

  importDataClear: function(cb) {
    this.dbCollection.remove({}, { multi: true }, function() {
      cb();
    });
  },

  importDataLine: function(str, cb) {
    cb();
  }
});
