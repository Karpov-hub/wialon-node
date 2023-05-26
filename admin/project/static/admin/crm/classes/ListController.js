Ext.define('Crm.classes.ListController', {
    extend: 'Ext.app.ViewController'
    
    ,init: function(view) {
        this.view = view;
        //this.model = Ext.create('Crm.modules.dashboard.model.DashboardModel');
                
        this.setControls()        
    }
    
    ,setControls: function() {
        var me = this;                    
        this.control({
            '[action=toxls]': {click: function(el) {me.createXls()}},
            '[action=topdf]': {click: function(el) {me.createPdf()}},
            '[action=print]': {click: function(el) {me.print()}}
                       
        })
    }
    
    ,createXls: function() {
        var me = this;
        this.view.store.dataModel.exportData({
            type: 'xls',
            _filters: this.view.store.getFilters().items
        }, function(fileName) {
            if(fileName)
                location = '/' + Object.getPrototypeOf(me.view.store.dataModel).$className + '.download/?fn=' + fileName;
            else
                D.a('Error', 'Error in export. Try later.')
        })
    }
    
    ,createPdf: function() {
        var me = this;
        this.view.store.dataModel.exportData({
            type: 'pdf',
            _filters: this.view.store.getFilters().items
        }, function(fileName) {
            if(fileName)
                location = '/' + Object.getPrototypeOf(me.view.store.dataModel).$className + '.download/?fn=' + fileName;
            else
                D.a('Error', 'Error in export. Try later.')
        })
    }
    
    ,print: function() {
        var me = this;
        this.view.store.dataModel.exportData({
            type: 'htm',
            _filters: this.view.store.getFilters().items
        }, function(html) {
            if(html) {
                var w = window.open('about:blank');
                w.document.write(html)
                setTimeout(function() {
                    w.print()
                },1000)
            } else
                D.a('Error', 'Error in export. Try later.')
        })
    }
    
    
})