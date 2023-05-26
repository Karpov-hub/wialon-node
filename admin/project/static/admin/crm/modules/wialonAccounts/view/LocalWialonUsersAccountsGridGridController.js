Ext.define("Crm.modules.wialonAccounts.view.LocalWialonUsersAccountsGridGridController", {
  extend: "Core.grid.EditableGridController",

  onEdit: function(editor, e) {
    var me = this;
    e.record.data = me.observeData(e.record.data);
    me.view.model.write(e.record.data, function(data, err) {
      if (me.view.fireEvent("save", me.view, data, e.record) === false) {
        return;
      }
      if (data && data.error) {
        D.a('Error', (data.error && data.error.message) ?
          data.error.message : "Something went wrong.");
      }
      else if (data.validationErrors) {
        var errorHtml = "";
        errorHtml = "<table border=\"1\"><tr><th>field</th><th>Error</th></tr>";
        data.validationErrors.forEach(error => {
          errorHtml += "<tr><td>" + error.field + "</td><td>" + error.message + "</tr>";
        })
        errorHtml += "</table>";
        D.a('Validations Errors:', errorHtml);
      }
      else {
        // if (data && data.record) {
        //   e.record.data = e.record.data; //data.record
        //   e.record.commit();
        // }
        me.view.store.reload();
      }
    });
  }
});
