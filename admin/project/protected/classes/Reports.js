Ext.define('Crm.classes.Reports', {
  buildWorkBook: function(fName) {
    var excelbuilder = require('msexcel-builder-colorfix');
    //require('msexcel-builder');

    return excelbuilder.createWorkbook(this.config.userFilesDir, fName);
  },

  buildSheet: function(workbook, title, headers, data) {
    var c = 0,
      line = 1;
    if (headers) c = headers.length;
    else for (var i in data[0]) c++;
    var sheet = workbook.createSheet(title, c, data.length + 1);

    if (headers) {
      headers.forEach((h, i) => {
        sheet.font(i + 1, line, { bold: 'true' });
        if (h.width) sheet.width(i + 1, h.width);
        sheet.set(i + 1, line, h.title);
      });
      line++;
    }
    data.forEach(d => {
      var j = 1;
      if (headers) {
        headers.forEach(h => {
          var x = d[h.name];
          if (!!h.renderer) {
            x = h.renderer(x, d);
          }
          sheet.set(j++, line, x || '');
        });
      } else {
        for (var i in d) {
          sheet.set(j++, line, d[i] || '');
        }
      }
      line++;
    });
  },
});
