Ext.define("Crm.modules.wialonAccounts.view.WialonAccountsGrid", {
  extend: "main.GridContainer",

  title: D.t("Wialon Accounts"),
  iconCls: "x-fa fa-money",
  requires: ["Core.grid.ComboColumn"],

  filterbar: true,
  filterable: false,
  autoscroll: true,

  buildColumns: function() {
    var me = this;
    return [
      {
        text: D.t("Wialon Username"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "wialon_username"
      },
      {
        text: D.t("Wialon Token"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "wialon_token"
      },
      {
        text: D.t("Wialon Hosting URL"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "wialon_hosting_url"
      },
      {
        text: D.t("Organization"),
        sortable: true,
        flex: 1,
        filter: true,
        dataIndex: "organization_name"
      },
      {
        text: D.t("Organization Id"),
        dataIndex: "organization_id",
        hidden: true,
        hideable: false
      }
    ];
  },

  buildFormItems: function(request) {
    var me = this;
    return [
      {
        name: "wialon_username",
        fieldLabel: D.t("Enter User Name*"),
        value:
          request && request.wialon_username ? request.wialon_username : "",
        allowBlank: false
      },
      me.buildOraganization(
        "organization_id",
        request && request.organization_id
          ? request.organization_id
          : me && me.observeObject && me.observeObject.organization_id
          ? me.observeObject.organization_id
          : "",
        request
      ),
      {
        name: "wialon_hosting_url",
        fieldLabel: D.t("Enter Wialon Hosting URL*"),
        value:
          request && request.wialon_hosting_url
            ? request.wialon_hosting_url
            : "",
        allowBlank: false
      },
      {
        name: "wialon_token",
        fieldLabel: D.t("Enter Wialon Token*"),
        value: request && request.wialon_token ? request.wialon_token : ""
      }
    ];
  },

  buildOraganization: function(name, value, request) {
    var me = this;
    this.oraganizationStore = Ext.create("Core.data.Store", {
      dataModel: Ext.create(
        "Crm.modules.organizations.model.OrganizationsComboModel"
      ),
      fieldSet: ["organization_name", "id"],
      forceSelection: false,
      allowBlank: false,
      scope: this
    });
    return {
      xtype: "combo",
      name: name ? name : "organization_name",
      fieldLabel: D.t("Select Organization *"),
      displayField: "organization_name",
      valueField: "id",
      queryMode: "remote",
      queryParam: "query",
      triggerAction: "query",
      typeAhead: true,
      value: value ? value : "",
      minChars: 2,
      width: "100%",
      anyMatch: true,
      store: this.oraganizationStore,
      allowBlank: false,
      readOnly: me.organizationFlag
        ? true
        : request && request.id
        ? true
        : false,
      forceSelection: true
    };
  }
});
