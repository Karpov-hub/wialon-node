Ext.define("Crm.modules.references.view.ReferencesFormController", {
  extend: "Core.form.FormController",

  setControls: function() {
    this.control({
      "[action=formclose]": {
        click: (el) => {
          this.closeView();
        }
      }
    });
    this.view.on("download", (data, index) => {
      this.download(data, index);
    });

    this.callParent(arguments);
  },

  setValues(data) {
    if (data && data.route_id && data.route_id.id) {
      data.route_id = data.route_id.id;
    }
    this.callParent(arguments);
    if (data.file_id && data.file_id.length > 0) {
      for (let file of data.file_id) {
        let link = `<a href="${__CONFIG__.downloadFileLink}/${file.code}/${
          data.hash
        }/admin_download">${file.filename}</a> (${[
          parseInt(file.file_size / 1024)
        ]}K)<br/>`;
        let line = this.view.down("[name=filelink]").add({
          xtype: "panel",
          layout: "hbox",
          scrollbar: true,
          width: Ext.Element.getViewportWidth() * 0.17,
          items: [
            {
              xtype: "displayfield",
              value: link,
              flex: 4,
              margin: 5
            },
            {
              xtype: "button",
              iconCls: "x-fa fa-trash",
              // flex: 4,
              margin: 5,
              handler: () => {
                this.removeFile(file, line);
              }
            }
          ]
        });
      }
    }
    return;
  },

  async removeFile(file, line) {
    const data = this.view.down("form").getValues();
    const res = await this.model.callApi(
      "reference-service",
      "deleteFileFromReference",
      { file, recordData: data },
      null,
      localStorage.uid
    );
    line.destroy();
    return D.a("Action Complete", res.message);
  },

  async save() {
    const data = this.view.down("form").getValues();
    const res = await this.model.callApi(
      "reference-service",
      "createReference",
      data,
      null,
      localStorage.uid
    );
    if (res.success) {
      this.view.store.reload();
      D.a("SUCCESS", "Action is successfully completed.");
      return this.closeView();
    } else {
      return D.a(
        "FAIL",
        res.message
          ? res.message
          : "Action is not complete. Please, contact to Dev Team."
      );
    }
  }
});
