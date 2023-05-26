Ext.define('Crm.modules.users.view.GroupsForm', {
    extend: 'Core.form.FormWindow'

    , titleTpl: '{name}'
    , formMargin: '0'
    , formLayout: 'border'
    , iconCls: 'x-fa fa-users'

    , requires: [
        'Ext.grid.column.Check'
    ]

    , controllerCls: 'Crm.modules.users.controller.GroupsController'

    , buildItems: function () {
        return [
            this.buildField(), {
                xtype: 'tabpanel',
                region: 'center',
                layout: 'fit',
                items: [
                    this.modulesAccessGrid(),
                    this.apiAccessGrid()
                ]
            }

        ]
    }

    , buildField: function () {
        return {
            xtype: 'panel',
            region: 'north',
            layout: 'anchor',
            margin: '5',
            defaults: {
                xtype: 'textfield',
                anchor: '100%',
                labelWidth: 200
            },
            items: [
                {
                    name: 'name',
                    fieldLabel: D.t('Group name *'),
                    allowBlank: false                                
                }, {
                    name: 'code',
                    fieldLabel: D.t('Code *'),
                    allowBlank: false                                
                },/* {
                    name: 'level',
                    fieldLabel: D.t('Level (1 is lowest and 100 is highest)')
                }, */{
                    name: 'description',
                    fieldLabel: D.t('Description')
                }, {
                    name: 'autorun',
                    fieldLabel: D.t('Autorun')
                }]
        }
    }

    , modulesAccessGrid: function () {
        var me = this;
        return {
            region: 'center',
            xtype: 'grid',
            cls: 'email-inbox-panel shadow-panel',
            action: 'model-access',
            title: D.t('Modules'),

            store: Ext.create("Ext.data.Store", {
                fields: ['name', 'hname', 'read', 'add', 'modify', 'del', 'ext']
            }),
            columns: [
                {
                    text: D.t("Model name"),
                    flex: 1,
                    menuDisabled: true,
                    sortable: true,
                    dataIndex: 'hname'
                    //renderer: function(v) {return D.t(v.trim())}
                }, {
                    text: D.t("Read"),
                    xtype: 'checkcolumn',
                    sortable: false,
                    menuDisabled: true,
                    width: 80,
                    dataIndex: 'read'
                }, {
                    text: D.t("Add"),
                    xtype: 'checkcolumn',
                    sortable: false,
                    menuDisabled: true,
                    width: 80,
                    dataIndex: 'add',
                    editor: {
                        xtype: 'checkbox',
                        cls: 'x-grid-checkheader-editor'
                    }
                }, {
                    text: D.t("Modify"),
                    xtype: 'checkcolumn',
                    sortable: false,
                    menuDisabled: true,
                    width: 80,
                    dataIndex: 'modify'
                }, {
                    text: D.t("Delete"),
                    xtype: 'checkcolumn',
                    sortable: false,
                    menuDisabled: true,
                    width: 80,
                    dataIndex: 'del'
                },{
                    xtype:'actioncolumn',
                    width: 22,
                    items: [{
                        iconCls: 'x-fa fa-pencil-square-o',
                        tooltip: D.t('Edit the record'),
                        handler: function(grid, rowIndex) {
                            me.fireEvent('editextra', grid, grid.getStore().getAt(rowIndex))
                        }
                    }]
                }
            ]
        }
    }

    , apiAccessGrid: function () {
        return {
            region: 'center',
            xtype: 'grid',
            cls: 'email-inbox-panel shadow-panel',
            action: 'api-access',
            title: D.t('API'),

            store: Ext.create("Ext.data.Store", {
                fields: ['name', 'hname', 'read', 'add', 'modify', 'del', 'ext']
            }),
            columns: [
                {
                    text: D.t("API URL"),
                    flex: 1,
                    menuDisabled: true,
                    sortable: true,
                    dataIndex: 'hname'
                    //renderer: function(v) {return D.t(v.trim())}
                }, {
                    text: D.t("Read"),
                    xtype: 'checkcolumn',
                    sortable: false,
                    menuDisabled: true,
                    width: 80,
                    dataIndex: 'read'
                }, {
                    text: D.t("Add"),
                    xtype: 'checkcolumn',
                    sortable: false,
                    menuDisabled: true,
                    width: 80,
                    dataIndex: 'add',
                    editor: {
                        xtype: 'checkbox',
                        cls: 'x-grid-checkheader-editor'
                    }
                }, {
                    text: D.t("Modify"),
                    xtype: 'checkcolumn',
                    sortable: false,
                    menuDisabled: true,
                    width: 80,
                    dataIndex: 'modify'
                }, {
                    text: D.t("Delete"),
                    xtype: 'checkcolumn',
                    sortable: false,
                    menuDisabled: true,
                    width: 80,
                    dataIndex: 'del'
                }
            ]
        }
    }

    ,buildButtons: function() {
        var btns = [
            {text: D.t('Save and close'), iconCls:'x-fa fa-check-square-o', scale: 'medium', action: 'save',disabled:true},
            {text: D.t('Save'), iconCls:'x-fa fa-check', action: 'apply',disabled:true},
            '-',
            {text: D.t('Close'), iconCls:'x-fa fa-ban', action: 'formclose'}    
        ]
        if(this.allowCopy)
            btns.splice(1,0,{tooltip: D.t('Make a copy'), iconCls:'x-fa fa-copy', action: 'copy'})
        return btns;
    }

})