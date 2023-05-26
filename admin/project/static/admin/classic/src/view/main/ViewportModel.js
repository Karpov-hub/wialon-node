Ext.define('Admin.view.main.ViewportModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.mainviewport',

    data: {
        currentView: null
    }
    
    
    ,constructor: function() {
        this.observWs();
        this.observMsg();
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
    
    
    ,observMsg: function() {
        if(!Glob.ws) {            
            setTimeout(() => {
                
                //me.set('newMsg', 'online')
                //me.set('msgCount', 5)
                
                this.observMsg()
            }, 1000)
            return;
        }
        
        this.msgObj = Ext.create('Crm.modules.messages.model.MessagesModel')
        
        this.setMsgCount()
        
        Glob.ws.subscribe('mainToolbar', 'Crm.modules.messages.model.MessagesModel', (action, data) => {
            if(data.touser.indexOf(localStorage.getItem('uid')) != -1) {
                this.setMsgCount()               
            }
            
        })
        
    }
    
    ,setMsgCount: function() {
        var me = this;
        me.msgObj.getNewMessagesCount(function(cnt) {
            me.set('newMsg', cnt? 'online':'offline')
            me.set('msgCount', cnt? cnt:'')    
        })
        
    }
    
});
