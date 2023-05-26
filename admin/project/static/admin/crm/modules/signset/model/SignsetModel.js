/*!
 * @Date : 03-23-2016
 * @Author : Datta Bhise
 * @Copyright Enovate IT Outsourcing Pvt Ltd.
 */

Ext.define('Crm.modules.signset.model.SignsetModel', {
    extend: "Core.data.DataModel"
    ,collection: 'signset'
    ,removeAction: 'remove'
    ,fields: [{
        name: '_id',
        type: 'ObjectID',
        visible: true
    },
    {
        name: 'module',
        type: 'string',
        filterable: true,
        editable: true,
        visible: true
    },{
        name: 'priority',
        type: 'array',
        filterable: false,
        editable: true,        
        visible: true,
        items: [{
            name: 'flow',
            type: 'string'
        },{
            name: 'group',
            type: 'ObjectID'
        },{
            name: 'user',
            type: 'ObjectID'
        }]
    },{
        name: 'active',
        type: 'boolean',
        filterable: true,
        editable: true,
        visible: true
    }]

});