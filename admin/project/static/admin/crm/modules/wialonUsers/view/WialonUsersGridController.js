Ext.define("Crm.modules.wialonUsers.view.WialonUsersGridController", {
  extend: "main.GridController",

  setControls: function() {
    var me = this;
    me.callParent(arguments);
    this.view.on("show_wialon_accounts", function(grid, indx) {
      me.showAccounts(grid.getStore().getAt(indx).data);
    });
  },

  showAccounts: function(request) {
    var me = this,
      formId;
    var formExistFlag =
      window.location.hash.indexOf(
        "Crm.modules.organizations.view.OrganizationsForm~"
      ) != -1
        ? true
        : false;
    if (formExistFlag) {
      formId = window.location.hash.split("~")[1];
    }
    if (
      me &&
      me.view &&
      me.view.observeObject &&
      me.view.observeObject.organization_id
    ) {
      formId = me.view.observeObject.organization_id;
    }
    var showAccountsWin = Ext.create("Ext.window.Window", {
      width: "60%",

      name: "notesWin",

      title: "Wialon Accounts",

      iconCls: "x-fa fa-files-o",

      modal: true,

      items: [
        {
          xtype: "form",
          layout: "anchor",
          padding: 10,
          defaults: { xtype: "textfield", anchor: "100%", labelWidth: 100 },
          items: [
            {
              xtype: "panel",
              //title: D.t('Wialon Accounts'),
              //iconCls: 'x-fa fa-money',
              layout: "fit",
              autoscroll: true,
              action: 2,
              items: Ext.create(
                "Crm.modules.wialonAccounts.view.LocalWialonUsersAccountsGrid",
                {
                  title: null,
                  iconCls: null,
                  scope: this,
                  autoscroll: true,
                  observe: [
                    {
                      property: "organization_id",
                      operator: "eq",
                      param: "organization_id"
                    }
                  ],
                  filterable: false,
                  organizationFlag: true,
                  createModel: function() {
                    return Ext.create(
                      "Crm.modules.wialonAccounts.model.LocalWialonUsersAccountsModel"
                    );
                  },
                  getStoreConfig: function() {
                    return {
                      filterParam: "q",
                      remoteFilter: true,
                      dataModel: this.model,
                      scope: this,
                      scrollable: true,
                      exProxyParams: { user_id: request.id },
                      pageSize: this.pageSize,
                      fieldSet: this.fields
                    };
                  },
                  buildColumns: function() {
                    var me = this;
                    this.on("render", function() {
                      var filters = me.store.getFilters();
                      filters.add({
                        property: "organization_id",
                        value: formId,
                        operator: "eq"
                      });
                      me.store.reload();
                    });
                    return [
                      {
                        text: D.t("User Id"),
                        dataIndex: "user_id",
                        hidden: true,
                        hideable: false
                      },
                      {
                        text: D.t("Active"),
                        dataIndex: "active",
                        sortable: true,
                        flex: 0.5,
                        editor: me.buildActiveCombo(),
                        renderer: function(v) {
                          return v ? "Yes" : "No";
                        }
                      }
                    ];
                  }
                }
              )
            }
          ]
        }
      ],
      listeners: {
        close: function() {
          if (addBtn) {
            addBtn.enable();
          }
          if (me && me.view && me.view.store) {
            me.view.store.reload();
          }
        }
      }
    }).show();
  }
});
