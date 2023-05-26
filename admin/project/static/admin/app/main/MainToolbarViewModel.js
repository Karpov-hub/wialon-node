Ext.define('main.MainToolbarViewModel', {
    extend: 'main.TopToolbarModel'
    
    ,constructor() {
        this.observMsg()
        this.callParent(arguments)
    }
    
    ,observMsg: function() {
        var me = this;
        if(!Glob.ws) {            
            setTimeout(function() {
                
                //me.set('newMsg', 'online')
                //me.set('msgCount', 5)
                
                me.observMsg()
            }, 1000)
            return;
        }
        
        this.msgObj = Ext.create('Crm.modules.messages.model.MessagesModel');
        
        this.setMsgCount();
        
        Glob.ws.subscribe('Crm.modules.messages.model.MessagesModel', 'Crm.modules.messages.model.MessagesModel', function(action, data) {
            if(data && data.touser && data.touser.indexOf(localStorage.getItem('uid')) != -1) {
                me.setMsgCount()               
            }            
        });        
    }
    
    ,setMsgCount: function() {
        var me = this;

        me.msgObj.getNewMessagesCount(function(cnt) {
            me.set('newMsg', cnt? 'online':'offline')
            me.set('msgCount', cnt? cnt:'')    
        })
        
    }
    
    
});