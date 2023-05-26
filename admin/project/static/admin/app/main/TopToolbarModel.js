Ext.define('main.TopToolbarModel', {
    extend: 'Ext.app.ViewModel'
    
    ,constructor: function() {
        this.observWs()
        this.callParent(arguments)
    }
    
    ,observWs: function() {
        var me = this;
        if(!Glob.ws) {            
            setTimeout(function() {
                me.observWs()
            }, 1000)
            return;
        }
        var lostEv = function() {
            me.set('status', 'offline')
        }
        var okEv = function() {
            me.set('status', 'online')
        }
        okEv()
        Glob.ws.on('open', okEv)        
        Glob.ws.on('error', lostEv)
        Glob.ws.on('close', lostEv)
        this.readUserProfile()
        
    }
    
    ,readUserProfile: function() {
        var me = this
            ,id = localStorage.getItem('uid');   
        Ext.ProfileModel = Ext.create('Crm.modules.profile.model.ProfileModel',{
            recordId: id,
            onRecordUpdate: function(data) {
                
                if(data.photo === undefined) {
                    data.photo = me.get('user').photo.split('?')[0] + '?_dc=' + new Date().getTime();
                }
                me.set('user', data)    
            }
        })
       
        Ext.ProfileModel.readRecord(id, function(data) {
            data.name = data.name || data.login;
            me.set('user', data)
            
            if(data.preferences)
                Ext.userPreferences = data.preferences;
            else
                Ext.userPreferences = {}
        })
    }
    
})