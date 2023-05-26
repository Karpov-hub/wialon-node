
Ext.define('Crm.modules.ratesPackages.view.OrganizationRatesPackagesGrid', {
    extend: "Crm.modules.ratesPackages.view.RatesPackagesGrid",
    
    controllerCls:'Crm.modules.ratesPackages.view.OrganizationRatesPackagesGridController',

    buildButtonsColumns: function() {
      var me = this;
      return [
        {
          xtype: "actioncolumn",
          width: 54,
          menuDisabled: true,
          items: [
            {
              iconCls: "x-fa fa-pencil-square-o",
              tooltip: D.t("Change selected package"),
              isDisabled: function() {
                return !me.permis.modify && !me.permis.read;
              },
              handler: function(grid, rowIndex) {
                me.fireEvent("edit", grid, rowIndex);
              }
            }
          ]
        }
      ];
    }

    , buildTbar: function () {
      var items = [];
      items.push('-', {
        tooltip: D.t('Reload Data'),
        iconCls: 'x-fa fa-refresh',
        action: 'refresh',
        text: D.t('Refresh')
      });
      if (this.filterable)
        items.push('->', this.buildSearchField())
      return items;
    }

})
