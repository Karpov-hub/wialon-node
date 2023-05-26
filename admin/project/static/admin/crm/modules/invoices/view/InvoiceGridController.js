Ext.define('Crm.modules.invoices.view.InvoiceGridController', {
    extend: 'main.GridController'

    ,setControls: function() {
        var me = this;
        me.callParent(arguments);
        this.view.on("getInvoiceDetails", function(grid, indx) {
          var data=grid.getStore().getAt(indx).data;
          me.model.runOnServer("getInvoiceDetails",{invoiceId:data.id}, function(res) {
            if(res && res.error){
              D.a('Failure', 'Error: '+res.error);
            }
            else{
              me.showInvoiceDetails(res);
            }
          })
        });
        this.view.on("downloadInvoice", async function(grid, indx) {
          var data=grid.getStore().getAt(indx).data;
          let secret_key = await this.model.getSecretKey({uid: localStorage.uid});
          me.model.runOnServer("downloadInvoice",{invoiceId:data.id}, function(res) {
            if(res && res.error){
              D.a('Failure', 'Error: '+res.error);
            }
            else{
              window.open(res.downloadUrl+'/'+secret_key+'/admin_download','_blank');
              D.a('Success', 'Please click <a href="'+res.downloadUrl+'/'+secret_key+'/admin_download" target="_blank">link</a> in case your browser doesn\'t automatically open link.');
            }
          })
        });
        this.view.on("downloadUsageReport", async function(grid, indx) {
          var data=grid.getStore().getAt(indx).data;
          let secret_key = await this.model.getSecretKey({uid: localStorage.uid});
          me.model.runOnServer("downloadUsageReport",{invoiceId:data.id,organization_id:data.organization_id}, function(res) {
            if(res && res.error){
              D.a('Failure', 'Error: '+res.error);
            }
            else{
              window.open(res.downloadUrl+'/'+secret_key+'/admin_download','_blank');
              D.a('Success', 'Please click <a href="'+res.downloadUrl+'/'+secret_key+'/admin_download" target="_blank">link</a> in case your browser doesn\'t automatically open link.');
            }
          })
        });
    }


    ,showInvoiceDetails:function(request){
        var me=this;
        var showInvoiceDetailsWin = Ext.create('Ext.window.Window', {
          width: '60%',

          height: '70%',

          autoScroll:true,

          name: 'invoiceWin',

          title: 'INVOICE DETAIL',

          iconCls: 'x-fa fa-files-o',

          modal: true,

          items: [{
            xtype: 'form',
            layout: 'anchor',
            padding: 10,
            items: [
              {
                xtype:'panel',
                defaults: { 
                  xtype: 'displayfield', 
                  anchor: '100%', 
                  labelWidth: 120,
                  padding: 10,
                  width:'50%' 
                },
                layout:'hbox',
                items:[
                  {
                    fieldLabel: D.t('Organization Name'),
                    name:'organization_name',
                    value:request.organization_name
                  },
                  {
                    fieldLabel: D.t('Invoice Date'),
                    name:'invoice_date',
                    value:Ext.Date.format(new Date(request.invoice_date), 'd.m.Y')
                  }
                ]
              },
              {
                xtype: 'grid',
                border:true,
                margin:{top:5},
                name:'resources', 
                store: {
                    fields: ['key','title','quantity','amount']
                },
                columns: [
                  { 
                    text: 'Resource Description',
                    style: {
                      fontWeight: 'bold'
                    },
                    dataIndex: 'title', 
                    flex: 2
                  },
                  { 
                    text: 'Quantity', 
                    style: {
                      fontWeight: 'bold'
                    },
                    dataIndex: 'quantity', 
                    flex: 1
                  },
                  { 
                    text: 'Amount',
                    style: {
                      fontWeight: 'bold'
                    }, 
                    dataIndex: 'amount',
                    flex: 1 
                  }
                ],
                listeners:{
                  render:function(e,v){
                    this.up().down('[name=resources]').store.loadData(request.resources || [], true)
                  }
                }
              },
              {
                xtype: 'menuseparator',
                margin:{top:5},
                style: {
                  fontWeight: 'bold'
                },
                width: '100%'
              },
              {
                xtype:'panel',
                defaults: { 
                  xtype: 'displayfield', 
                  anchor: '100%', 
                  labelWidth: 100,
                  width:'58%' 
                },
                layout:'hbox',
                items:[
                  {
                   
                  },
                  {
                    xtype: 'panel',
                    width: '42%',
                    defaults: {
                      xtype: 'displayfield',
                      anchor: '100%',
                      labelWidth: 100,
                      width: '50%'
                    },
                    items: [
                      {
                        fieldLabel: D.t('Tax'),
                        name: 'tax_percentage',
                        value: request.tax_percentage
                      },
                      {
                        fieldLabel: D.t('Adjustment'),
                        name: 'adjustment',
                        value: request.adjustment
                      },
                      {
                        fieldLabel: D.t('<b>Total Amount</b>'),
                        name: 'total_amount',
                        value: request.total_amount
                      }
                    ]
                  }
                ]
              }
            ]
          }]
      }).show();
    }
})
