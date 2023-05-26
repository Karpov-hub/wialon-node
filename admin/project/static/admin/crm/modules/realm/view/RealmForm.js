Ext.define("Crm.modules.realm.view.RealmForm", {
  extend: "Core.form.FormWindow",

  titleTpl: "{name}",
  iconCls: "x-fa fa-venus-mars",
  requires: ["Desktop.core.widgets.GridField"],
  formLayout: "fit",

  formMargin: 0,

  controllerCls: "Crm.modules.realm.view.RealmFormController",

  buildItems: function() {
    return {
      xtype: "tabpanel",
      layout: "border",
      items: [this.buildGeneral(), this.buildPermissionsGrid()]
    };
  },

  buildTransactions() {
    return {
      xtype: "panel",
      region: "east",
      cls: "grayTitlePanel",
      width: "40%",
      layout: "fit",
      split: true,
      title: D.t("Transactions"),
      items: Ext.create("Crm.modules.transactions.view.UserTransactionsGrid", {
        scope: this,
        observe: [{ property: "user_id", param: "id" }]
      })
    };
  },

  buildGeneral() {
    return {
      xtype: "panel",
      title: D.t("General"),

      padding: 5,
      layout: "anchor",
      style: "background:#ffffff",
      defaults: { xtype: "textfield", labelWidth: 150, anchor: "100%" },
      items: [
        {
          name: "id",
          hidden: true
        },
        {
          name: "name",
          fieldLabel: D.t("Realm name")
        },
        {
          name: "ip",
          fieldLabel: D.t("IP address")
        },
        {
          name: "domain",
          fieldLabel: D.t("Domain")
        },
        {
          xtype: "fieldcontainer",
          layout: "hbox",
          items: [
            {
              name: "token",
              xtype: "textfield",
              labelWidth: 150,
              flex: 1,
              fieldLabel: D.t("Access token")
            },
            {
              xtype: "button",
              action: "gentoken",
              width: 150,
              text: D.t("Generate token")
            }
          ]
        },
        {
          xtype: "xdatefield",
          name: "ctime",
          fieldLabel: D.t("Created time"),
          format: D.t("d.m.Y H:i:s O"),
          flex: 1,
          readOnly: true
        }
      ]
    };
  },

  buildPermissionsGrid() {
    return {
      xtype: "panel",
      title: D.t("Permissions"),
      //region: "center",
      layout: "fit",
      items: {
        xtype: "gridfield",
        name: "permiss",
        fields: ["service", "method", "description", "access"],
        buildTbar() {
          return null;
        },
        columns: [
          {
            text: D.t("Service"),
            flex: 1,
            sortable: true,
            dataIndex: "service"
          },
          {
            text: D.t("Method"),
            flex: 1,
            sortable: true,
            dataIndex: "method"
          },
          {
            text: D.t("Description"),
            flex: 1,
            sortable: true,
            dataIndex: "description"
          },
          {
            text: D.t("Access"),
            width: 70,
            dataIndex: "access",
            editor: {
              xtype: "checkbox",
              inputValue: true,
              uncheckedValue: false
            },
            action: "permissHeader",
            renderer(v) {
              return v ? "YES" : "";
            }
          }
        ]
      }
    };
  }
});
