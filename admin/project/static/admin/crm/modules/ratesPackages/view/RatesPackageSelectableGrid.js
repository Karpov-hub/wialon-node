Ext.define('Crm.modules.ratesPackages.view.RatesPackageSelectableGrid', {
    extend: 'Crm.modules.ratesPackages.view.RatesPackagesGrid',

    autoScroll:true,
    scrollable: true   

   ,controllerCls:'main.ReadableGridController'

    ,initComponent: function() {
        this.model =  Ext.create('Crm.modules.ratesPackages.model.RatesPackagesModel');
        this.callParent(arguments) 
    }

    ,buildItems: function() {
        var me=this,plugins = [],columns = {items: this.columns}
        me.selectedUsers=[];
        if(this.filterbar) {
                plugins.push({
                ptype: 'filterbar',
                renderHidden: false,
                showShowHideButton: false,
                showClearAllButton: true
            })
            columns.plugins = [{
                ptype: 'gridautoresizer'
            }]
        }
            
        var cfg = {
            xtype: 'grid',
            id:'ratesPackages',
            plugins: plugins,
            title: this.title,
            iconCls: this.iconCls,
            store: this.store,
            readOnly:true,            
            tbar: this.buildTbar(),
            bbar: this.buildPaging(),
            selModel: {
                checkOnly: false,
                injectCheckbox: 'first',
                showHeaderCheckbox : false,
                allowDeselect: true,
                mode: 'SINGLE'
            },
            selType: 'checkboxmodel',
            columns: columns,
            listeners:{
                afterrender:function(grid){
                    grid.store.reload();
                }
            },
        };
        if(this.gridCfg) {
            for(var i in this.gridCfg) cfg[i] = this.gridCfg[i];
        }
         return cfg;
            
    }
    
   
    ,buildButtonsColumns: function() {return [] }


    ,dockedItems: []


    ,buildTbar: function() {
        var me=this;
        me.store.on('load', function (st, data) {
            var selectedPackages = Ext.getCmp('ratesPackages').getSelectionModel().selected.items||[];
            if (data.length && !selectedPackages.length){
                var ratePackageExist=false,ratePackageIndex=0;
                for(var i=0;i<data.length;i++){
                    if(data[i].id == __CONFIG__.ratePackageId){
                        ratePackageExist=true;
                        ratePackageIndex=i;
                        break;
                    }
                }
                if(ratePackageExist){
                    Ext.getCmp('ratesPackages').selModel.doSelect(me.store.data.items[ratePackageIndex]);
                }
            }
        });
        return [{
                tooltip: D.t('Reload data'),
                iconCls: 'x-fa fa-refresh',
                action: 'refresh'
            },'-',{
                xtype: 'button',
                margin:{left:10},
                formBind:true,
                // id: 'payoutbutton',
                style:'background-color:#35baf6;',
                text: D.t('<i class="fa fa-check-square-o" style="color:white"></i>&nbsp;&nbsp;<b style = "font-size: 14px;color:white;">Save</b>'),
                listeners:{
                    click: function (e) {
                        var i=0,selectedPackages = Ext.getCmp('ratesPackages').getSelectionModel().selected.items||[];
                        if(selectedPackages&&selectedPackages.length){
                            if(selectedPackages.length > 1){
                                D.a(D.t('<b style="font-size:14px">Failure</b>'),D.t('<b style="color:red;font-size:14px">Please select single package in grid.</b>'))
                            }else{
                                me.selectedPackages=[];
                                for(i=0;i<selectedPackages.length;i++){
                                    me.selectedPackages.push(selectedPackages[i].data.id)
                                }
                                me.savePackageInOrganization({
                                    selectedPackages:me.selectedPackages,
                                    organization_id:__CONFIG__.rates_orgnization_id
                                },e)
                            }
                        }else{
                            D.a(D.t('<b style="font-size:14px">Failure</b>'),D.t('<b style="color:red;font-size:14px">Please select single package in grid.</b>'))
                        }
                    }
                }
            }
        ];
    }

    ,savePackageInOrganization:function(reqData,actionBtn){
        var me=this;
        this.controller.model.runOnServer("savePackageInOrganization",reqData,function(res){    
            if (res && res.error) {
                if (actionBtn) { actionBtn.enable(); }
                D.a('Error',(res.error && 
                res.error.message) ? res.error.message : 
                "Something went wrong.");
            }else{
                D.a('SUCCESS','Action completed successfully.')
                if(__CONFIG__.showRatesPackagesWindow){
                    __CONFIG__.showRatesPackagesWindow.close();
                }
            }
        })  
    }
})
