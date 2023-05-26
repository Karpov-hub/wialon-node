Ext.define('main.TopToolbarController', {
    extend: 'Ext.app.ViewController',
    
    init: function(view) {
        this.view = view;       
        this.observWs()
    }
    
    ,observWs: function() {
        if(!Glob.ws) {
            var me = this;
            setTimeout(function() {
                me.observWs()
            }, 1000)
            return;
        }
        var flagEl = this.view.down('[action=online-flag]');
        
        var lostEv = function() {
            flagEl.addCls('status-offline')
            flagEl.setTooltip('connection is lost')
        }
        var okEv = function() {
            flagEl.removeCls('status-offline')
            flagEl.setTooltip('connection to the server is established')
        }
        okEv()
        Glob.ws.on('open', okEv)        
        Glob.ws.on('error', lostEv)
        Glob.ws.on('close', lostEv)
        
        this.readUserProfile()
    }
    
    ,readUserProfile: function() {
        var me = this
            ,model = Ext.create('Crm.modules.profile.model.ProfileModel');            
        model.readRecord(localStorage.getItem('uid'), function(data) {
            me.view.down('[action=username]').setText(data.name || data.login)
            if(data.photo)
                me.view.down('[action=userimage]').setSrc(data.photo)
        })
    }
})