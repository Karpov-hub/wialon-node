
Ext.define('Core.grid.ImportWindow', {
    extend: 'Ext.window.Window'

    ,requires: [
        'Ext.ux.form.FileUploadField'    
    ]
    ,autoShow: true
    ,modal: true
    
    ,iconCls:'x-fa fa-cloud-download'
    ,layout: 'anchor'
    
    ,padding: 10
    ,width: 500
    
    ,requires: ['Core.Ajax']
    
    ,title: D.t('Import data')
    
    ,initComponent() {    
        this.buttons = this.buildButtons()       
        this.items = this.buildItems()
        this.callParent(arguments)
    }
    
    ,buildItems: function() {
        return [Ext.create('Ext.form.field.File', {
            //xtype: 'fileuploadfield',
            name: 'file',            
            anchor: '100%',
            labelWidth: 170,
            fieldLabel: D.t('Chose a file for import')
        }),{ 
            xtype: 'checkbox',
            name: 'clear',            
            labelWidth: 170,
            fieldLabel: D.t('Clear old records')
        }]
    }
    
    ,buildButtons: function() {
        var me = this;
        return [
            {text: D.t('Import'), iconCls:'x-fa fa-check', handler: function() {
                me.doImport()
            }},
            '-',
            {text: D.t('Cancel'), iconCls:'x-fa fa-ban', handler: function() {me.close()}}            
            
        ]
    }
    
    ,doImport: function() {
        var me = this
            ,inp = me.down('[name=file]');
                
        if(inp.fileInputEl.dom.files.length>0) {
            var fn = inp.fileInputEl.dom.files[0].name || inp.fileInputEl.dom.files[0].fileName;
            
            Ext.create('Core.Ajax').upload(inp.fileInputEl.dom.files[0], '/Admin.Data.uploadFile/', function(data) {
                if(data.response && data.response.name) {
                    me.model.importDataFromFile({tmpName: data.response.name, fileName: fn, clear: me.down('[name=clear]').getValue()}, function(res) {
                        if(res && res.count)
                            D.a('Import', 'Imported %s records.', [res.count])
                        me.close();
                    })
                }
            })                    
        }  
    }     
    
});