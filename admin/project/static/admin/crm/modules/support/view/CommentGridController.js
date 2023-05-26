Ext.define("Crm.modules.support.view.CommentGridController", {
  extend: "Core.grid.GridController",

  setControls() {
    this.control({
      "[action=attach]": {
        click: (el, v) => {
          this.showHideAttachment();
        }
      },
      "[action=send]": {
        click: (el, v) => {
          this.send();
        }
      }
    });
    this.callParent(arguments);
    this.view.on("afterrender", (el, o) => {
      return el.store.load();
    });
  },

  // показать/скрыть панель аттача
  showHideAttachment() {
    if ((this.shoAttach = !this.shoAttach)) this.view.attachPanel.show();
    else this.view.attachPanel.hide();
  },

  gotoRecordHash() {}, // переопределяем эту функцию, что бы при двойном клике не переходило к редактированию

  async send() {
    try {
      this.view.down("[action=send]").setDisabled(true);
      const files = this.view.down("[name=files]").getValue();
      const filesEl = this.view.down("[name=files]");
      const data = {
        ticket_id: this.view.observeObject.ticket_id,
        sender: localStorage.uid,
        message: this.view.down("[name=message]").getValue(),
        files: files,
        realm_id: this.view.scope.down("[name=realm_id]").getValue(),
        is_user_message: false
      };
      if (data && !data.message) {
        return D.a("ERROR", "Message is required!");
      } else if (data.ticket_id && (data.message || data.files.length)) {
        const res = await this.model.callApi(
          "support-service",
          "createComment",
          data,
          data.realm_id,
          localStorage.uid
        );
        if (res && !res.success) {
          return D.a("ERROR", res.message);
        }
        this.view.store.reload();
        this.view.down("[name=message]").setValue("");
        this.view.down("[name=files]").setValue({});
        if (!!files && files.length) {
          const keysOfLines = Object.keys(filesEl.lines);
          for (const line of keysOfLines) {
            filesEl.removeFile(filesEl.lines[line]);
          }
        }
      }
    } finally {
      this.view.down("[action=send]").setDisabled(false);
    }
  }
});
