Ext.define("Crm.modules.references.view.ReferencesGridController",{
    extend: "Core.grid.GridController",
    
    gotoRecordHash: function(data) {
        if (!!this.view.observeObject) {
          window.__CB_REC__ = this.view.observeObject;
        }
        if (data && data[this.view.model.idField]) {
          var hash =
            this.generateDetailsCls() + "~" + data[this.view.model.idField];
          if (this.view.detailsInDialogWindow) {
            Ext.create(this.generateDetailsCls(), {
              noHash: true,
              recordId: data[this.view.model.idField],
              store: this.view.store
            });
          } else if (this.view.detailsInNewWindow) window.open("./#" + hash);
          else location.hash = hash;
        }
      },
});