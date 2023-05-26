Ext.define("Admin.view.main.Viewport", {
  extend: "Ext.container.Viewport",
  xtype: "mainviewport",

  requires: ["Ext.list.Tree"],

  controller: "mainviewport",
  viewModel: {
    type: "mainviewport"
  },

  cls: "sencha-dash-viewport",
  itemId: "mainView",

  layout: {
    type: "vbox",
    align: "stretch"
  },

  listeners: {
    //render: 'onMainViewRender'
  },

  items: [
    {
      xtype: "toolbar",
      cls: "sencha-dash-dash-headerbar toolbar-btn-shadow",
      height: 64,
      itemId: "headerBar",
      items: [
        {
          xtype: "component",
          reference: "senchaLogo",
          cls: "sencha-logo",
          html: '<div class="main-logo">&nbsp;</div>',
          width: 250
        },
        {
          margin: "0 0 0 8",
          cls: "delete-focus-bg",
          iconCls: "x-fa fa-navicon",
          id: "main-navigation-btn",
          handler: "onToggleNavigationSize"
        },
        {
          xtype: "tbspacer",
          flex: 1
        },
        {
          cls: "delete-focus-bg",
          iconCls: "x-fa fa-envelope-o message-offline",
          href: "#Crm.modules.messages.view.MessagesGrid",
          hrefTarget: "_self",
          tooltip: D.t("Messages"),
          bind: {
            iconCls: "x-fa fa-envelope-o message-{newMsg}",
            text: "{msgCount}",
            tooltip: D.t("New messages: {msgCount}")
          }
        },
        {
          cls: "delete-focus-bg",
          bind: {
            iconCls: "x-fa fa-server status-{status}",
            tooltip: "{status}"
          }
        },
        {
          //xtype: 'tbtext',
          bind: {
            text: "{user.name}"
          },
          href: "#Crm.modules.profile.view.Profile",
          hrefTarget: "_self",
          cls: "top-user-name"
        },

        {
          text: D.t("Logout"),
          view: "Admin.view.authentication.Login",
          iconCls: "x-fa fa-sign-out",
          handler: () => {
            D.c("Logout", "Are you sure?", [], () => {
              location = "#authentication.login";
            });
            //href: '#authentication.login'
          }
        }
      ]
    },
    {
      xtype: "maincontainerwrap",
      id: "main-view-detail-wrap",
      reference: "mainContainerWrap",
      flex: 1,
      items: [
        {
          xtype: "treelist",
          reference: "navigationTreeList",
          itemId: "navigationTreeList",
          ui: "navigation",
          store: "NavigationTree",
          width: 250,
          expanderFirst: false,
          expanderOnly: false,
          listeners: {
            selectionchange: "onNavigationTreeSelectionChange"
          }
        },
        {
          xtype: "container",
          flex: 1,
          style: "oveflow-y: auto;",
          reference: "mainCardPanel",
          cls: "sencha-dash-right-main-container",
          itemId: "contentPanel",
          layout: {
            type: "card",
            anchor: "100%"
          }
        }
      ]
    }
  ]
});
