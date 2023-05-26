Ext.define('Crm.modules.settings.model.DbDumpModel', {    
    extend: "Core.data.DataModel"
    
    ,collection: 'reports' // scope:server
    
    

    ,fields: [{
        name: '_id',
        type: 'ObjectID',
        visible: true
    }]
    
    /* scope:client */
    ,makeDbDump: function(pass, cb) {     
        this.runOnServer('makeDbDump', {pass:pass}, cb)
    }
    
    /* scope:server */
    ,$makeDbDump: function(params, cb) {
        let child_process = require('child_process');
        const fileName = Math.random();
        child_process.exec(this.config.dumpCommand.replace('{pass}', params.pass).replace('{file}',this.config.dumpPath + fileName),() => {
            cb({file: fileName})
        });       
    }
    
    /* scope:server */
    ,$dwl: function(params, cb) {
        const fs = require('fs');
        const filename = this.config.dumpPath + params.file;
        const stat = fs.statSync(filename);
        
        this.response.writeHeader(200, {
            "Content-Length": stat.size,
            "Content-Disposition": "attachment; filename=\""+encodeURIComponent(params.name)+"\""
        });
        
        let fReadStream = fs.createReadStream(filename);
        fReadStream.on('data', (chunk) => {
            if(!this.response.write(chunk)){
                fReadStream.pause();
            }
        });
        fReadStream.on('end', () => {
            this.response.end();
            fs.unlink(filename)
        });
        this.response.on("drain", () => {
            fReadStream.resume();
        });
    }
   
})