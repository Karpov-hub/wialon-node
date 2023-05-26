Ext.define("Crm.modules.docs.view.FilesList", {
  extend: "Ext.form.FieldContainer",

  layout: "anchor",

  requires: ["Ext.form.field.File"],
  mixins: {
    field: "Ext.form.field.Field"
  },

  buttonText: D.t("Browse..."),
  buttonTooltip: D.t("Select file"),

  buttonWidth: 100,
  buttonHeight: 25,

  initComponent() {
    this.items = [this.buildUploadField()];
    this.callParent(arguments);
    this.on({
      render: () => {
        //this.addLine();
      }
    });
  },

  buildUploadField() {
    return {
      xtype: "filefield",
      name: "fileuploadfield",
      msgTarget: "side",
      allowBlank: true,
      buttonOnly: true,
      width: this.buttonWidth,
      height: this.buttonHeight,
      //fieldStyle: 'width:'+ me.width +'px;height:' + me.height+'px;',
      buttonConfig: {
        tooltip: this.buttonTooltip,
        text: this.buttonText,
        width: this.buttonWidth,
        height: this.buttonHeight
      },
      listeners: {
        change: (el) => {
          this.onFileSelect(el);
        }
      }
    };
  },

  onFileSelect(el) {
    if (el.fileInputEl.dom.files.length > 0) {
      this.addLine(el.fileInputEl.dom.files[0]);
    }
  },

  addLine(file) {
    const line = this.add({
      xtype: "fieldcontainer",
      anchor: "100%",
      file,
      layout: "hbox",
      items: [
        {
          xtype: "button",
          text: "!" + file.name,
          cls: "link-button",
          width: 250,
          height: 25,
          textAlign: "left",
          border: false,
          handler: () => {
            this.fireEvent("clickfile", line, file);
          }
        },
        {
          xtype: "button",
          height: 25,
          iconCls: "x-fa fa-trash",
          handler: () => {
            this.removeFile(line, file);
          }
        }
      ]
    });
    if (!this.lines) this.lines = {};
    this.lines[line.id] = line;
  },

  removeFile(line, file) {
    delete this.lines[line.id];
    line.destroy();
    // get the file upload element
    let fileField = this.down("[name=fileuploadfield]").fileInputEl.dom;
    // get the file upload parent element
    let parentNod = fileField.parentNode;
    // create new element
    let tmpForm = document.createElement("form");
    parentNod.replaceChild(tmpForm, fileField);
    tmpForm.appendChild(fileField);
    tmpForm.reset();
    parentNod.replaceChild(fileField, tmpForm);
  },

  setValue: function(value) {
    if (value && Ext.isArray(value)) {
      value.forEach((file) => {
        this.addLine(file);
      });
    }
    this.fireEvent("change", this, value);
  },

  getValue: function() {
    let out = [];
    if (this.lines) {
      Object.keys(this.lines).forEach((key) => {
        out.push(this.lines[key].file);
      });
    }
    return out;
  },

  getSubmitData: function() {
    var res = {};
    res[this.name] = this.getValue();
    return res;
  }
});
