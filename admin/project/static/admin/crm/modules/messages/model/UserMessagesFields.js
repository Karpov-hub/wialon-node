/*!
 * @Date : 10-07-2016
 * @Author : Datta Bhise
 * @Copyright Enovate IT Outsourcing Pvt Ltd.
 */

Ext.define('Crm.modules.messages.model.UserMessagesFields', {
    extend: "Core.data.DataModel"
    , collection: 'UserMessages'
    , removeAction: 'remove'
    , fields: [
        {
            name: '_id',
            type: 'ObjectID',
            visible: true
        },
        {
            name: 'Member_id',
            type: 'StrID',
            editable: true,
            visible: true
        },
        {
            name: 'title',
            type: 'string',
            editable: true,
            visible: true
        },
        {
            name: 'template',
            type: 'string',
            visible: true,
            editable: true,
        },
        {
            name: 'short_msg',
            type: 'string',
            editable: true,
            visible: true
        },
        {
            name: 'type',
            type: 'string',
            visible: true
        },
        {
            name: 'payload',
            type: 'object',
            visible: true
        },
        {
            name: 'inProgress',
            type: 'boolean',
            editable: true,
            visible: true
        },
        {
            name: 'sent',
            type: 'boolean',
            visible: true
        },
        {
            name: 'ctime',
            type: 'date',
            sort: -1,
            visible: true
        },
        {
            name: 'send_sms',
            type: 'boolean',
            editable: true,
            visible: true
        },
        {
            name: 'send_email',
            type: 'boolean',
            editable: true,
            visible: true
        },
        {
            name: 'send_push',
            type: 'boolean',
            editable: true,
            visible: true
        },
        {
            name: 'sentAll',
            type: 'boolean',
            editable: true,
            visible: true
        },
        {
            name: 'sentPush',
            type: 'boolean',
            editable: true,
            visible: true
        }, {
            name: 'sentSms',
            type: 'boolean',
            editable: true,
            visible: true
        }, {
            name: 'sentEmail',
            type: 'boolean',
            editable: true,
            visible: true
        }, {
            name: 'sentPushStatus',
            type: 'string',
            editable: true,
            visible: true
        }, {
            name: 'sentSmsStatus',
            type: 'string',
            editable: true,
            visible: true
        }, {
            name: 'sentEmailStatus',
            type: 'string',
            editable: true,
            visible: true
        },{
            name: 'timesTried',
            type: 'number',
            editable: true,
            visible: true
        },

    ],


});