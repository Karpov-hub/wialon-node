
Ext.define('Crm.modules.accountHolders.view.LocalUsersGrid', {
    extend: "Crm.modules.accountHolders.view.UsersGrid",

    buildColumns: function () {
        const renderer = (v, m, r) => {
            if (!r.data.active) {
              m.tdCls = "disabled-row";
            }
            return v;
          };
        return [
            {
                text: D.t("E-mail"),
                flex: 1,
                sortable: true,
                filter: true,
                dataIndex: "email",
                editor: {
                  xtype: 'textfield',
                  // maskRe : /[A-Za-z]*$/,
                  allowBlank: false
                }
                // renderer
              },
              {
                text: D.t("Name"),
                flex: 1,
                sortable: true,
                filter: {
                  xtype: 'textfield',
                  // maskRe : /[A-Za-z]*$/
                },
                dataIndex: 'name',
                editor: {
                  xtype: 'textfield',
                  // maskRe : /[A-Za-z]*$/,
                  allowBlank: false
                }
              },
              {
                text: D.t("Organization"),
                flex: 1,
                sortable: true,
                filter: true,
                dataIndex: "organization_id",
                renderer: (v, m, r) => {
                  return renderer(v ? v.organization_name : "", m, r);
                }
              },
              {
                text: D.t("Role"),
                flex: 1,
                sortable: true,
                filter: true,
                dataIndex: "role_id",
                renderer: (v, m, r) => {
                  return renderer(v ? v.role : "", m, r);
                }
              },
              {
                text: D.t("Realm"),
                flex: 1,
                sortable: true,
                filter: true,
                dataIndex: "realm",
                renderer: (v, m, r) => {
                  return renderer(v ? v.name : v, m, r);
                }
              },
              {
                text: D.t("Status"),
                dataIndex: "is_active",
                flex: 1,
                sortable: true,
                filter: {
                  xtype: "combo",
                  valueField: "key",
                  displayField: "val",
                  store: {
                    fields: ["key", "val"],
                    data: [
                      { key: "true", val: D.t("Activated") },
                      { key: "false", val: D.t("Disabled") }
                    ]
                  }
                },
                // renderer: (v, m, r) => {
                //   return renderer(v ? D.t("Activated") : "", m, r);
                // }
              },
              {
                text: D.t("Is Blocked By Admin?"),
                sortable: true,
                flex: 1,
                dataIndex: 'is_blocked_by_admin',
                filter: {
                  xtype: "combo",
                  valueField: "key",
                  displayField: "val",
                  store: {
                    fields: ["key", "val"],
                    data: [
                      { key: "true", val: D.t("Blocked") },
                      { key: "false", val: D.t("Not blocked") }
                    ]
                  }
                },
                renderer: function (v) {
                  return (v) ? "Blocked" : "Not blocked";
                }
              }
        ]   
    }

})
