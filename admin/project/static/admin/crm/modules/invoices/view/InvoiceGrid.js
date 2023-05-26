
Ext.define('Crm.modules.invoices.view.InvoiceGrid', {
    extend: "main.GridContainer",

    title: D.t('Invoices'),
    iconCls: 'fa fa-info-circle',    
    requires: ['Core.grid.ComboColumn'],

    filterbar: true,
    filterable: false,
    autoscroll: true, 
    
    controllerCls:'Crm.modules.invoices.view.InvoiceGridController',
   
    buildColumns: function () {
        var me=this;
        return [
            {
                text: D.t("Adjustment"),
                flex: 1,
                sortable: true,
                filter: true,
                dataIndex: 'adjustment'
            },{
                text: D.t("Total Fees"),
                flex: 1,
                sortable: true,
                filter: true,
                dataIndex: 'total_fees'
            },{
                text: D.t("Organization"),
                sortable: true,
                flex:1,
                filter: true,
                hidden:true,
                hideable: false,
                dataIndex: 'organization_name'
            },
            {
                text: D.t("Organization Id"),
                dataIndex: 'organization_id',
                hidden:true,
                hideable: false
            },
            {
              text: D.t("Invoice Date"),
              xtype: 'datecolumn',
              flex: 1,
              sortable: true,
              filter:{
                  xtype:'datefield',format: D.t('d/m/Y'),submitFormat: 'Y/m/d'
              },               
              dataIndex: 'invoice_date',
              renderer: function (v, m, r) {
                  return Ext.Date.format(new Date(v), 'd.m.Y g:i:s');
              }
          }]   
    }

  
  ,buildButtonsColumns: function() {
    var me = this;
    return [
      {
        xtype: "actioncolumn",
        width: 104,
        menuDisabled: true,
        items: [
          {
            iconCls: "x-fa fa-pencil-square-o",
            tooltip: this.buttonEditTooltip,
            isDisabled: function() {
              return !me.permis.modify && !me.permis.read;
            },
            handler: function(grid, rowIndex) {
              me.fireEvent("edit", grid, rowIndex);
            }
          },
          {
            iconCls: "x-fa fa-info-circle",
            tooltip: D.t('Get Invoice Details'),
            isDisabled: function() {
              return !me.permis.modify && !me.permis.read;
            },
            handler: function(grid, rowIndex) {
              me.fireEvent("getInvoiceDetails", grid, rowIndex);
            }
          },
          {
            iconCls:'x-fa fa-download',
            tooltip: D.t('Download Invoice Report'),
            isDisabled: function() {
              return !me.permis.modify && !me.permis.read;
            },
            handler: function(grid, rowIndex) {
              me.fireEvent("downloadInvoice", grid, rowIndex);
            }
          },
          {
            iconCls:'x-fa fa-download',
            tooltip: D.t('Download Usage Report'),
            isDisabled: function() {
              return !me.permis.modify && !me.permis.read;
            },
            handler: function(grid, rowIndex) {
              me.fireEvent("downloadUsageReport", grid, rowIndex);
            }
          }
        ]
      }
    ];
  }


  , buildFormItems: function (request) {
    var me = this;
    return [
      me.buildOraganization("organization_id",(request && request.organization_id) ? request.organization_id:( (me && me.observeObject && me.observeObject.organization_id) ? me.observeObject.organization_id :""),request),
      {
        xtype:'numberfield',
        name: 'adjustment',
        fieldLabel: D.t('Adjustment'),
        value: (request && request.adjustment) ? request.adjustment:0,
        allowBlank: false
      }
    ] 
  } 

  , buildOraganization: function (name, value, request) {
    var me = this;
    this.oraganizationStore = Ext.create('Core.data.Store', {
      dataModel: Ext.create('Crm.modules.organizations.model.OrganizationsComboModel'),
      fieldSet: ['organization_name', 'id'],
      forceSelection: false,
      allowBlank: false,
      scope: this
    });
    return {
      xtype: 'combo',
      name: name ? name : 'organization_name',
      fieldLabel: D.t('Select Organization *'),
      displayField: 'organization_name',
      valueField: 'id',
      queryMode: 'remote',
      queryParam: 'query',
      triggerAction: 'query',
      typeAhead: true,
      value: value ? value : "",
      minChars: 2,
      width: "100%",
      anyMatch: true,
      store: this.oraganizationStore,
      allowBlank: false,
      readOnly: me.organizationFlag ? true : (request && request.id ? true : false),
      forceSelection: true
    }
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
