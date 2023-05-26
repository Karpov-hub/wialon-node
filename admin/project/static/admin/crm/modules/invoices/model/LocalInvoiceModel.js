Ext.define('Crm.modules.invoices.model.LocalInvoiceModel', {
    extend: 'Crm.modules.invoices.model.InvoiceModel',

    /* scope:server */
    getData: function(params, cb){
        var me=this, organizationFlag=false;
        params._filters=params._filters ? params._filters : params.filters;
        if(params && params._filters && params._filters.length>0){
            if(params._filters[0].property){
                for(var i=0;i<params._filters.length;i++){
                    params._filters[i]._property = params._filters[i]._property ? params._filters[i]._property : params._filters[i].property;
                    params._filters[i]._value = params._filters[i]._value ? params._filters[i]._value : params._filters[i].value;
                }
            }
            for(var i=0;i<params._filters.length;i++){
                if(params._filters[i]._property=="organization_id" || params._filters[i]._property=="id"){
                    organizationFlag=true;
                    break;
                }
            }
        }
        if(organizationFlag){
            me.callParent(arguments);
        }
        else{
            return cb({list:[], total:0});
        }
    }
})

    