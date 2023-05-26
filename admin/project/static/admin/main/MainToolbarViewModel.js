Ext.define('main.MainToolbarViewModel', {
    extend: 'main.TopToolbarModel'
    
    ,constructor() {
        this.observMsg()
        this.callParent(arguments)
    }
    
    ,observMsg: function() {
        var me = this;
        if(!Core.ws) {            
            setTimeout(function() {
                
                //me.set('newMsg', 'online')
                //me.set('msgCount', 5)
                
                me.observMsg()
            }, 1000)
            return;
        }
        
        this.msgObj = Ext.create('Crm.modules.messages.model.MessagesModel')
        
        this.setMsgCount()
        
        Core.ws.subscribe('mainToolbar', 'Crm.modules.messages.model.MessagesModel', function(action, data) {
            if(data.to.indexOf(localStorage.getItem('uid')) != -1) {
                me.setMsgCount()               
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