
Ext.define('Crm.modules.wialonAccounts.view.LocalWialonUsersAccountsGrid', {
    extend: 'Core.grid.EditableGrid',

  title: D.t('Wialon Accounts'),
  iconCls: 'x-fa fa-money',
  requires: ['Core.grid.ComboColumn'],

  filterbar: true,
  filterable: false,
  autoscroll: true,  

  controllerCls:'Crm.modules.wialonAccounts.view.LocalWialonUsersAccountsGridGridController',
  
  buildActiveCombo:function(){
    return  {
        xtype: 'combo',
        editable: false,   
        valueField: 'code',
        displayField: 'status',
        queryMode: 'local',
        anchor: '100%',  
        store: Ext.create('Ext.data.ArrayStore', {
            fields: ['code', 'status'],
            data: [[0,D.t('No')],[1,D.t('Yes')]]
        })
    }
  }

  , buildTbar: function () {
    var items = [];
    items.push("-", {
      tooltip: this.buttonReloadText,
      iconCls: "x-fa fa-refresh",
      action: "refresh"
    }, '-', {
      xtype: 'label',
      name: 'editLabel',
      text: 'Editable Grid: Double click on "Active" column cell to enable/disable account for user.',
      style: 'font-weight: bold;font-size: 12px;'
    });
    if (this.filterable) items.push("->", this.buildSearchField());
    return items;
  }

  ,buildButtonsColumns: function() {
    var me = this;
    return []
  }

})
