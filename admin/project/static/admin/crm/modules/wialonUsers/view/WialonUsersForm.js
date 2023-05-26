Ext.define('Crm.modules.wialonUsers.view.WialonUsersForm', {
    extend: 'main.FormWindow'

    , titleTpl: 'Wialon User: {name}'
    , formMargin: '0'
    , iconCls: 'x-fa fa-users'
    ,height:'60%'
    ,padding:10

    , requires: [
        'Ext.grid.column.Check'
    ]

    , buildItems: function () {
        var me=this;
        return [ 
        {
            name:'id',
            hidden:true
        },
        {
            name:'role_id',
            hidden:true,
            listeners:{
                change:function(e,v){
                    if(v){
                        me.down('[name=email]').setReadOnly(true);
                        me.down('[name=organization_id]').setReadOnly(true);
                        me.down('[name=pass]').getEl().show();
                    }
                }
            }
        },
        me.buildOraganization("organization_id"),
        {
            name:'name',
            fieldLabel: D.t('Enter Name*'),
            allowBlank:false
        },
        {
            name:'email',
            fieldLabel: D.t('Enter Email*'),
            validator:function(v){
                var emailValidator = /^[a-zA-Z0-9]+[a-zA-Z0-9.!#$%&*+-/=?^_{|}~]*@[a-zA-Z0-9.-]+[a-zA-Z0-9]+\.[a-zA-Z]{2,10}$/;
                return emailValidator.test(v) ? true:'Please enter email in proper format:user@example.com.';
            },  
            allowBlank:false
        },
        {
            xtype: 'combo',
            fieldLabel: D.t('Is Active?*'),
            editable: false,  
            name:'is_active',
            valueField: 'code',
            displayField: 'status',
            queryMode: 'local',
            anchor: '100%',  
            store: Ext.create('Ext.data.ArrayStore', {
                fields: ['code', 'status'],
                data: [[false,D.t('No')],[true,D.t('Yes')]]
            }),
            allowBlank:false
        },
        {
            xtype: 'combo',
            fieldLabel: D.t('Is Blocked By Admin?*'),
            editable: false,  
            name:'is_blocked_by_admin',
            valueField: 'code',
            displayField: 'status',
            queryMode: 'local',
            anchor: '100%',  
            store: Ext.create('Ext.data.ArrayStore', {
                fields: ['code', 'status'],
                data: [[false,D.t('Not blocked')],[true,D.t('Blocked')]]
            }),
            allowBlank:false
        },
        {
            name:'pass',
            width: '100%',  
            anchor: '100%',  
            inputType: 'password',
            hidden:true,
            fieldLabel: D.t('Enter Password')
        }]
    }


    ,buildOraganization: function(name,value) {
        var me=this;
        this.oraganizationStore = Ext.create('Core.data.Store', {
            dataModel: Ext.create('Crm.modules.organizations.model.OrganizationsComboModel'),
            fieldSet: ['organization_name','id'],
            forceSelection: false,
            allowBlank: false,
            scope: this
        });
        return {
            xtype: 'combo',
            name: name?name:'organization_name',
            fieldLabel: D.t('Select Organization *'),
            displayField: 'organization_name',
            valueField: 'id',
            queryMode: 'remote',
            queryParam: 'query',
            triggerAction : 'query',
            typeAhead: true,
            value:value?value:"",
            minChars: 2,
            width:"100%",
            anyMatch: true,
            store: this.oraganizationStore,
            allowBlank:false,
            readOnly:me.organizationFlag?true:false,
            forceSelection : true
        }
    }

})