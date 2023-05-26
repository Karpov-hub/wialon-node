Ext.define("Crm.modules.users.view.UsersForm", {
  extend: "Core.form.FormWindow",

  titleTpl: "User: {login}",

  requires: ["Ext.ux.form.ItemSelector", "Ext.form.field.Tag"],

  buildItems: function() {
    return [
      {
        name: "login",
        fieldLabel: D.t("Login *"),
        allowBlank: false
      },
      {
        name: "name",
        fieldLabel: D.t("User name *"),
        allowBlank: false
      },
      {
        name: "tel",
        fieldLabel: D.t("Phone *"),
        allowBlank: false
      },
      {
        name: "email",
        fieldLabel: D.t("Email *"),
        allowBlank: false
      },
      {
        name: "ip",
        fieldLabel: D.t("Valid IP *"),
        allowBlank: false
      },
      {
        name: "pass",
        inputType: "password",
        fieldLabel: D.t("Password *"),
        allowBlank: false
      },
      this.buildGroupCombo(),
      this.buildXGroups(),
      {
        xtype: "xdatefield",
        name: "ctime",
        fieldLabel: D.t("Created time"),
        format: D.t("d.m.Y H:i:s O"),
        flex: 1,
        readOnly: true
      }
    ];
  },

  buildGroupCombo: function() {
    var me = this;
    return {
      xtype: "combo",
      name: "groupid",
      fieldLabel: D.t("Main group *"),
      valueField: "_id",
      displayField: "name",
      queryMode: "local",

      store: Ext.create("Core.data.ComboStore", {
        dataModel: Ext.create("Crm.modules.users.model.GroupsModel"),
        fieldSet: ["_id", "name"],
        scope: me
      }),
      allowBlank: false
    };
  },

  buildXGroups: function() {
    return {
      xtype: "tagfield",
      fieldLabel: D.t("Extended groups *"),
      store: Ext.create("Core.data.Store", {
        dataModel: "Crm.modules.users.model.GroupsModel",
        fieldSet: "_id,name"
      }),
      displayField: "name",
      valueField: "_id",
      queryMode: "local",
      name: "xgroups",
      filterPickList: true,
      allowBlank: false
    };
  },

  buildButtons: function() {
    var btns = [
      {
        text: D.t("Save and close"),
        iconCls: "x-fa fa-check-square-o",
        scale: "medium",
        action: "save",
        disabled: true
      },
      {
        text: D.t("Save"),
        iconCls: "x-fa fa-check",
        action: "apply",
        disabled: true
      },
      "-",
      { text: D.t("Close"), iconCls: "x-fa fa-ban", action: "formclose" }
    ];
    if (this.allowCopy)
      btns.splice(1, 0, {
        tooltip: D.t("Make a copy"),
        iconCls: "x-fa fa-copy",
        action: "copy"
      });
    return btns;
  }
});
