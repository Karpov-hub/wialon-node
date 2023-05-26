Ext.define('Crm.modules.messages.view.MessagesGridController', {
    extend: 'Core.grid.GridController'

    ,setControls: function() {
        var me = this;
        this.control({
            '[action=add]'    : {click: function(el) {me.addRecord() }},
            '[action=refresh]': {click: function(el) {me.reloadData()}},
            '[action=inbox]'  : {click: function(el) {me.changeBox('inbox')}},
            '[action=outbox]' : {click: function(el) {me.changeBox('outbox')}}
        })
        this.view.on('delete', function(grid, indx) {
            me.deleteRecord(grid.getStore(), indx)
        })
        
        this.view.on('expandmessage', function(rowNode , record , expandRow , eOpts) {
            //console.log('expand:', record)   
            me.markRecordAsRead(record)
        })
        
        var g = this.view.down('grid')
        this.originTitle = g.title
        g.setTitle(this.originTitle + ': ' + D.t('inbox'))
        
    } 
    
    ,changeBox: function(box) {
        this.view.store.addFilter({property: 'box', value:box})
        this.view.down('grid').setTitle(this.originTitle + ': ' + D.t(box))
        this.view.store.load()
    }
    
    ,markRecordAsRead: function(record) {
        if(record.data["new"]) {
            this.view.model.markAsRead(record.data._id, function() {
                record.data["new"] = false; 
                record.commit()
            })    
        }
    }

})