/**
 * @author Max Tushev
 * @scope Server, Client
 * The model for Users module
 * @private
 */
Ext.define('Crm.modules.settings.model.DocTypeModel', {    
    extend: "Core.data.DataModel"
    
    ,collection: _TABPREFIX + 'doctypes' // scope:server

    ,fields: [
    {
        name: '_id',
        type: 'ObjectID',
        visible: true
    },{
        name: 'name',
        type: 'string',
        filterable: true,
        editable: true,
        visible: true
    },{
        name: 'description',
        type: 'string',
        filterable: false,
        editable: true,
        visible: true
    },{
        name: 'lifetime',
        type: 'int',
        filterable: false,
        editable: true,
        visible: true
    },{
        name: 'orgtype',
        type: 'int',
        filterable: false,
        editable: true,
        visible: true
    },{
        name: 'active',
        type: 'boolean',
        filterable: false,
        editable: true,
        visible: true
    }]

    

})