Ext.define('main.MainToolbarViewModel', {
    extend: 'main.TopToolbarModel'
    
    ,constructor() {
        this.observMsg()
        this.callParent(arguments)
    }
    
    ,observMsg: function() {

        if(!Core.ws) {            
            setTimeout(() => {
                this.observMsg()
            }, 1000)
            return;
        }
        
        this.msgObj = Ext.create('Crm.modules.messages.model.MessagesModel');
        this.bgProcessObj = Ext.create('Crm.modules.messages.model.BgProcessModel');
        
        this.setMsgCount();
        this.setBgCount();
        
        Core.ws.subscribe('Crm.modules.messages.model.MessagesModel', 'Crm.modules.messages.model.MessagesModel', (action, data) => {
            if(data && data.touser && data.touser.indexOf(localStorage.getItem('uid')) != -1) {
                this.setMsgCount()               
            }            
        });
        
        Core.ws.subscribe('Crm.modules.messages.model.BgProcessModel', 'Crm.modules.messages.model.BgProcessModel', (action, data) => {
            this.setBgCount()               
        });
        
    }
    
    ,setMsgCount: function() {
        this.msgObj.getNewMessagesCount((cnt) => {
            this.set('newMsg', cnt? 'online':'offline')
            this.set('msgCount', cnt? cnt:'')    
        })
        
    }
    
    ,setBgCount: function() {
        this.bgProcessObj.getBgCount((data) => {
            this.set('inProgress', data.res && data.res.length? '1':'0')
            this.set('inProgressCount', data.res && data.res.length? data.res.length:'')    
        })
        
    }
    

    
});