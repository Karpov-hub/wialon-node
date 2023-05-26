Ext.define("Crm.modules.customReports.view.customReportsGridController", {
  extend: "Core.grid.GridController",

  setControls() {
    this.view.on("download", (data, index) => {
      this.download(data, index);
    });
    this.view.on("delete", (grid, indx) => {
      this.deleteRecord(grid.getStore(), indx);
    });

    this.callParent(arguments);
  },
  async download(data, index) {
    let secret_key = await this.model.getSecretKey({ uid: localStorage.uid });

    if (location.protocol == "http:") {

      location = `${location.protocol}//${location.hostname}:8012/download/${data[index].data.attachment_name}/${secret_key}/admin_download`;
    }

    if (location.protocol == "https:") {

      location = `${location.protocol}//${location.hostname}/download/${data[index].data.attachment_name}/${secret_key}/admin_download`;
    }

  },

  gotoRecordHash() { }
});
