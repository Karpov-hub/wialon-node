Ext.define("Crm.modules.aggregators.view.AggregatorsForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Aggregator") + ": {name} | {id}",
  iconCls: "fa fa-university",

  buildItems: function() {
    const storeForBoolean = {
      fields: ["key", "val"],
      data: [
        { key: true, val: D.t("Required") },
        { key: false, val: D.t("Not required") }
      ]
    };
    return [
      {
        name: "id",
        xtype: "textfield",
        readOnly: true,
        fieldLabel: D.t("ID")
      },
      {
        name: "name",
        xtype: "textfield",
        fieldLabel: D.t("Name"),
        allowBlank: false,
        maxLength: 255
      },
      {
        name: "name_for_custom_field",
        xtype: "textfield",
        fieldLabel: D.t("Name for custom fields"),
        allowBlank: false,
        maxLength: 255
      },
      {
        name: "api_key_required",
        xtype: "combo",
        valueField: "key",
        displayField: "val",
        store: storeForBoolean,
        allowBlank: false,
        editable: false,
        fieldLabel: D.t("API-key required")
      },
      {
        name: "log_pas_required",
        xtype: "combo",
        valueField: "key",
        displayField: "val",
        store: storeForBoolean,
        allowBlank: false,
        editable: false,
        fieldLabel: D.t("login - password required")
      },
      {
        name: "contract_number_required",
        xtype: "combo",
        valueField: "key",
        displayField: "val",
        store: storeForBoolean,
        allowBlank: false,
        editable: false,
        fieldLabel: D.t("Contract number required")
      },
      {
        name: "host",
        xtype: "textfield",
        fieldLabel: D.t("Aggregator API Domain"),
        allowBlank: false,
        maxLength: 255
      },
      {
        name: "method_for_check",
        xtype: "textfield",
        fieldLabel: D.t("Method for check"),
        allowBlank: false,
        maxLength: 255
      },
      {
        name: "method_for_get_data",
        xtype: "textfield",
        fieldLabel: D.t("Method for receiving transactions"),
        allowBlank: false,
        maxLength: 255
      },
      {
        name: "service_for_method",
        xtype: "textfield",
        fieldLabel: D.t("Service"),
        allowBlank: false,
        maxLength: 255
      },
      {
        name: "ctime",
        xtype: "xdatefield",
        readOnly: true,
        fieldLabel: D.t("Creation date"),
        format: "d.m.Y H:i:s O"
      }
    ];
  }
});
