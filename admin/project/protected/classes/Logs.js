const fs = require('fs');

Ext.define('Crm.classes.Logs', { 

    sendLog: function() {
        var text = '';
        for(var i=0;i<arguments.length;i++) {
            if(Ext.isArray(arguments[i]))
                text += arguments[i].join(',')
            else
            if(Ext.isObject(arguments[i]))
                text += JSON.stringify(arguments[i],null,4)
            else
                text += arguments[i]            
        }
        text += '\nAPI KEY: ' + this.config.SCOPUS["X-ELS-APIKey"];
        
        fs.appendFile('logbgproccess.txt', text, function (err) {});
        
        this.changeModelData('Crm.modules.logs.model.LogsModel', 'log', {text: text})
    }
})