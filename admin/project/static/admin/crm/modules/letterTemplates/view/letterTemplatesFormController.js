Ext.define("Crm.modules.letterTemplates.view.letterTemplatesFormController", {
  extend: "Core.form.FormController",

  setControls() {
    this.control({
      "[name=html]": {
        change: () => {
          this.changeHtml();
        }
      }
    });

    this.view.previewPanel.on("activate", () => {
      setTimeout(() => {
        this.buildPreview();
      }, 1000);
    });
    this.callParent(arguments);
  },

  changeHtml() {
    if (this.tout) clearTimeout(this.tout);
    this.tout = setTimeout(() => {
      this.buildPreview();
    }, 2000);
  },

  async buildPreview() {
    const data = this.view.down("form").getValues();
    if (!data.html || !data.data) return;
    const res = await this.model.callApi("mail-service", "preview", {
      tpl: data.html,
      data: JSON.parse(data.data)
    });
    if (res && res.html) {
      this.view.previewPanel
        .getEl()
        .down("iframe", true).contentWindow.document.body.innerHTML = res.html;
    }
  },

  setValues(data) {
    if (data && data.realm) data.realm = data.realm.id;
    this.callParent(arguments);
  },

  exportJson() {
    const data = this.view.down("form").getValues();
    delete data[this.model.idField];
    this.download(`${data.code}-${data.lang}.json`, JSON.stringify(data));
  }
});
