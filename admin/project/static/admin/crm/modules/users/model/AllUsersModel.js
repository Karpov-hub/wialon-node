/**
 * @author Max Tushev
 * @scope Server, Client
 * The model for Users module
 * @private
 */
Ext.define('Crm.modules.users.model.AllUsersModel', {    
    extend: "Core.data.DataModel"

    ,collection: 'users_all'
    
    ,removeAction: 'remove'

    ,fields: [{
        name: '_id',
        type: 'ObjectID',
        editable: false,
        visible: true
    },{
        name: 'name',
        type: 'string',
        filterable: true,
        editable: false,
        visible: true
    }]
    
    /* scope:server */
    ,constructor: function() {
        this.notCheckCollection = true;
        this.callParent(arguments);
    }
    
    /* scope:server */
    ,findData: function(collection, find, fields, sort, start, limit, cb) {
        fields = {_id:1, name:1}
        this.db.getData(collection, find, fields, sort, start, limit, function(total, data) {            
            cb(total, data)
        })
    }

})