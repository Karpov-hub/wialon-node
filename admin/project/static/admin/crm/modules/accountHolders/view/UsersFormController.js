Ext.define("Crm.modules.accountHolders.view.UsersFormController", {
  extend: "Core.form.FormController",

  setControls() {
    let me = this;
    this.control({
      "[action=formclose]": {
        click: function(el) {
          this.closeView();
        }
      },
      "[action=apply]": {
        click: function(el) {
          this.saveUser(false, function() {
            return;
          });
        }
      },
      "[action=save]": {
        click: function(el) {
          this.saveUser(true, function() {
            return;
          });
        }
      },
      "[action=remove]": {
        click: function(el) {
          this.deleteRecord_do(true);
        }
      }
    });
    this.view.on("show_wialon_accounts", function(grid, indx) {
      me.showAccounts(grid.getStore().getAt(indx).data);
    });
    this.view.down("form").on({
      validitychange: function(th, valid, eOpts) {
        let el = me.view.down("[action=apply]");
        if (el) el.setDisabled(!valid);
        el = me.view.down("[action=save]");
        if (el) el.setDisabled(!valid);
      }
    });
  },

  setValues(data) {
    //var Util = Ext.create('Crm.Utils.Util', {scope: me});
    if (data && data.realm) data.realm = data.realm.id;
    // if (data && data.pass) data.pass = Util.encrypt(data.pass);
    if (data && data.role_id) data.role_id = data.role_id.id;
    if (data && data.organization_id)
      data.organization_id = data.organization_id.id;

    this.callParent(arguments);
  },
  closeView() {
    window.history.go(-1);
  },

  saveUser(closeWin, cb) {
    const form = this.view.down("form").getValues();
    this.checkEmail(form, (res) => {
      if (res && res.success) {
        this.save(closeWin);
      } else {
        D.a("ERROR", res.message || "Something went wrong");
      }
      return cb();
    });
  },

  checkEmail(data, cb) {
    this.model.checkEmail(data, (res) => {
      if (res) return cb(res);
      else return cb({ success: false });
    });
  },

  showAccounts: function(request) {
    let me = this,
      formId;
    let formExistFlag =
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
    let showAccountsWin = Ext.create("Ext.window.Window", {
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
                "Crm.modules.accountHolders.view.LocalUsersGrid",
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
                      "Crm.modules.accountHolders.view.LocalUsersModel"
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
                    let me = this;
                    this.on("render", function() {
                      let filters = me.store.getFilters();
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
                        dataIndex: "is_active",
                        sortable: true,
                        flex: 0.5,
                        editor: me.buildActiveCombo(),
                        renderer: function(v) {
                          return v ? "Activated" : "Disabled";
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
