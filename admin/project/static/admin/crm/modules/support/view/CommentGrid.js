Ext.define("Crm.modules.support.view.CommentGrid", {
  extend: "Core.grid.GridContainer",
  filterable: true,

  controllerCls: "Crm.modules.support.view.CommentGridController",

  fields: [
    "id",
    "ctime",
    "ticket_id",
    "sender",
    "file_id",
    "realm_id",
    "message"
  ],

  // getStoreConfig: function() {
  //   return {
  //     filterParam: "q",
  //     remoteFilter: true,
  //     dataModel: this.model,
  //     scope: this,
  //     scrollable: true,
  //     exProxyParams: { ticket_id: this.scope.recordId },
  //     pageSize: this.pageSize,
  //     fieldSet: this.fields
  //   };
  // },

  buildItems: function() {
    const grid = this.callParent();

    Ext.apply(grid, {
      tbar: grid.bbar,
      bbar: null,
      hideHeaders: true,
      rowLines: false,
      disableSelection: true,
      region: "center"
    });

    this.attachPanel = Ext.create("Crm.modules.docs.view.FilesList", {
      name: "files",
      margin: 5,
      width: 300,
      hidden: true,
      split: true,
      region: "west",
      scrollable: true
    });

    return {
      xtype: "panel",
      layout: "border",

      items: [
        {
          xtype: "panel",
          region: "south",
          height: 150,
          split: true,
          layout: "border",
          tbar: [
            {
              iconCls: "x-fa fa-paperclip",
              tooltip: D.t("attach"),
              action: "attach"
            },
            "->",
            {
              iconCls: "x-fa fa-paper-plane",
              text: D.t("send comment"),
              action: "send"
            }
          ],
          items: [
            {
              xtype: "textarea",
              region: "center",
              name: "message",
              emptyText: D.t("Enter message")
            },
            this.attachPanel
          ]
        },
        grid
        //{ ...grid, ...extraProps }
      ]
    };
  },
  // <a href="#Crm.modules.accountHolders.view.UsersForm~'

  buildColumns: function() {
    return [
      {
        flex: 1,
        xtype: "templatecolumn",
        tpl: new Ext.XTemplate(
          `<div class="message type-{sender.type}">
        <div class="user"><b>{[this.nameRender(values)]}</b></div>
        <div class="text" style="white-space: normal";">{message}
        <p>
        <tpl for="file_id">
          <i class="x-fa fa-paperclip"></i>&nbsp;<a target="_blank" href="${__CONFIG__.downloadFileLink}/{code}/{hash}/admin_download">{filename}</a> ({[parseInt(values.file_size/1024)]}K)<br/>
        </tpl>
        </p>
        </div>
        <div class="date">{ctime:date("d.m.Y H:i:s O")}</div>
        </div>
        <hr/>`,
          {
            nameRender: function(values) {
              if (values.sender.type == 1)
                return (
                  '<a href="#Crm.modules.accountHolders.view.UsersForm~' +
                  values.sender.id +
                  '">' +
                  values.sender.name +
                  "</a>"
                );
              else return values.sender.login;
            }
          }
        )
      }
    ];
  },

  buildButtonsColumns: function() {
    // var me = this;
    return [];
    // return [
    //   {
    //     xtype: "actioncolumn",
    //     width: 30,
    //     menuDisabled: true,
    //     items: [
    //       {
    //         iconCls: "x-fa fa-trash",
    //         tooltip: this.buttonDeleteTooltip,
    //         isDisabled: function() {
    //           return !me.permis.del;
    //         },
    //         handler: function(grid, rowIndex) {
    //           me.fireEvent("delete", grid, rowIndex);
    //         },
    //       },
    //     ],
    //   },
    // ];
  }
});
