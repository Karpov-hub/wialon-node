var excelbuilder = require("msexcel-builder"),
  crypto = require("crypto");

Ext.define("Core.data.actions.Export", {
  /**
   * @method
   * Server method
   *
   * Creating XLS file
   * @param {Object} params
   * @param {Function} callback
   *
   */
  $exportData: function(params, cb) {
    var me = this;

    [
      function(call) {
        me.buildWhere(params, function(find) {
          Ext.apply(find, me.find);
          call(find);
        });
      },
      function(find, call) {
        me.getReadableFields(params, function(fields) {
          call(find, fields);
        });
      },
      function(find, fields, call) {
        me.buildSort(params, function(sort) {
          call(find, fields, sort);
        });
      },

      function(find, fields, sort, call) {
        this.db.getData(me.collection, find, fields, sort, 0, 10000, call);
      },
      function(total, data, next) {
        if (data)
          me.builData(
            data,
            function(data) {
              me.export2xls(data, cb);
            },
            null,
            params
          );
        else cb({});
      }
    ].runEach();
  },

  export2xls: function(data, cb) {
    var me = this,
      fName,
      workbook,
      cols = me.fields.length,
      rows = data.length,
      sheet1,
      l = 1;

    [
      function(next) {
        if (me.beforeExport) {
          me.beforeExport(data, next);
        } else next();
      },
      function(next) {
        crypto.randomBytes(32, function(ex, buf) {
          fName = buf.toString("hex") + ".xlsx";
          next();
        });
      },
      function(next) {
        workbook = excelbuilder.createWorkbook(me.config.userFilesDir, fName);
        sheet1 = workbook.createSheet("sheet1", cols + 1, rows + 1);

        var i = 1;
        for (var j = 0; j < me.fields.length; j++) {
          if (me.fields[j].exp !== false)
            sheet1.set(i++, l, me.fields[j].xlsTitle || me.fields[j].name);
        }
        l++;

        data.each(function(item) {
          var i = 1;
          for (var j = 0; j < me.fields.length; j++) {
            if (me.fields[j].exp !== false) {
              if (me.fields[j].renderer) {
                sheet1.set(
                  i,
                  l,
                  me.fields[j].renderer(item[me.fields[j].name], item)
                );
              } else if (
                me.db.fieldTypes[me.fields[j].type] &&
                !!me.db.fieldTypes[me.fields[j].type].getExportValue
              ) {
                sheet1.set(
                  i,
                  l,
                  me.db.fieldTypes[me.fields[j].type].getExportValue(
                    item[me.fields[j].name]
                  )
                );
              } else sheet1.set(i, l, item[me.fields[j].name]);
              i++;
            }
          }
          l++;
        });

        workbook.save(function(ok) {
          cb({ file: fName });
        });
      }
    ].runEach();
  }
});
