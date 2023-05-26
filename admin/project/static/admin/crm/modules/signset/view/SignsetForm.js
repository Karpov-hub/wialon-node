/*!
 * @Date : 03-23-2016
 * @Author : Datta Bhise
 * @Copyright Enovate IT Outsourcing Pvt Ltd.
 */
Ext.define('Crm.modules.signset.view.SignsetForm', {
    extend: 'Core.form.FormWindow'

    ,titleTpl: D.t('Workflow')+': {module}'
    ,iconCls: 'x-fa fa-user-plus'

    , requires: [
        'Desktop.core.widgets.GridField', 
        'Core.grid.ComboColumn'
    ]

    //,layout: 'border'
    , formLayout: 'border'
    , buildAllItems: function () {
        var me = this;

        return [{
            xtype: 'panel',
            region: 'north',
            border: false,
            bodyBorder: false,
            layout: 'anchor',
            bodyStyle: 'padding: 5px;',
            defaults: {
                anchor: '100%'    
            },
            items: [{
                name: '_id',
                xtype: 'textfield',
                hidden: true
            }, this.moduleCombo(), {
                name: 'active',
                xtype: 'checkbox',
                fieldLabel: D.t('Active')
            }]
        },this.buildGrid()]
    }
    
    ,buildGrid: function() {
        
        return {
            xtype: 'gridfield',
            hideLabel: true,
            region: 'center',
            name: 'priority',
            layout: 'fit',
            fields: ['group','user','flow'],
            columns: [{
                text: D.t("Flow name"),
                flex: 1,
                sortable: false,
                dataIndex: 'flow',
                menuDisabled: true,                              
                editor: true
            },{
                text: D.t("Group"),
                flex: 1,
                sortable: false,
                dataIndex: 'group',
                menuDisabled: true,                
                xtype: 'combocolumn',                
                model: 'Crm.modules.users.model.GroupsModel',                
                editor: this.groupCombo()
            },{
                text: D.t("User"),
                flex: 1,
                sortable: false,
                dataIndex: 'user',
                menuDisabled: true,
                xtype: 'combocolumn',                
                model: 'Crm.modules.users.model.UsersModel',  
                editor: this.userCombo()
            }]
        }
    }
    
    ,moduleCombo: function() {
        
        var store = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data: []
        })
        
        Ext.create('Crm.modules.users.model.GroupsModel').getModules(function(modules) {
            var arr = [], name
            for(var i=0;i<modules.length;i++) {
                name = D.t(modules[i].name)
                if(name != '-') arr.push({id: modules[i].name, name: name})
            }
            store.loadData(arr)    
        })
        
        return {
            xtype: 'combo',
            valueField: 'id',
            displayField: 'name',
            queryMode: 'local',
            name: 'module',
            allowBlank: false,
            fieldLabel: D.t('Module'),
            store: store
        }
    }
    
    ,groupCombo: function() {
        return {
            xtype: 'combo',
            valueField: '_id',
            displayField: 'name',
            queryMode: 'local',
            
            store: Ext.create('Core.data.ComboStore', {
                dataModel: Ext.create('Crm.modules.users.model.GroupsModel'),
                fieldSet: ['_id', 'name']
            })
        }
    }
    
    
    
    ,userCombo: function() {
        return {
            xtype: 'combo',
            valueField: '_id',
            displayField: 'name',
            queryMode: 'local',            
            store: Ext.create('Core.data.ComboStore', {
                dataModel: Ext.create('Crm.modules.users.model.UsersModel'),
                fieldSet: ['_id', 'name']
            })
        }
    }
});