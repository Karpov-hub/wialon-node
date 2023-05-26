/**
 * @author Max Tushev
 * @scope Server, Client
 * The model for Users module
 * @private
 */
Ext.define('Crm.modules.settings.model.DocsModel', {    
    extend: "Core.data.DataModel"

    ,collection: 'testtable1'

    ,fields: [
    {
        name: '_id',
        type: 'ObjectID',
        visible: true
    },
    {
        name: 'name',
        type: 'string',
        filterable: true,
        editable: true,
        visible: true
    },
    {
        name: 'email',
        type: 'string',
        filterable: true,
        vtype: 'email',
        editable: true,
        visible: true
    },{
        name: 'active',
        type: 'boolean',
        filterable: false,
        editable: false,
        visible: true
    }]

    

})