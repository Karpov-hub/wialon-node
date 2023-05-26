Ext.define("Database.drivers.Postgresql.Transactions", {

    poolConnections: 5, // number of open persistent connections
    freeTimeout: 5000, // (ms) the time at which the connection is forcibly released
    waitTime: 10, // (ms) timeout before the next attempt to get free connection (if all connections are busy)
    
    debug: false,


    init: function(config, cb) {
        this.conns = [];
        this.config = config;
        
        if(this.config.pgsql.poolConnections) 
            this.poolConnections = this.config.pgsql.poolConnections;
        
         if(this.config.pgsql.freeTimeout) 
            this.freeTimeout = this.config.pgsql.freeTimeout;
        
         if(this.config.pgsql.waitTime) 
            this.waitTime = this.config.pgsql.waitTime;
        
        var me = this;
        setInterval(function() {
            me.freeByTimeout()
        }, 1000)
        cb();
    },
    
    newConnection: function(cb) {
        var me = this,
            opt = Ext.clone(this.config.pgsql);       

        opt.onError = function(err, client) {
            me.conns = [];
            process.exit();
        }        
            
        opt.callback = function (conn) {
            cb(conn);
        }
        return Ext.create("Database.drivers.Postgresql.Database", opt);
    },
    
    getConnection: function(cb) {
        var tm = new Date().getTime();        
        for(var i=0;i < this.conns.length; i++) {
            if(!this.conns[i].isBusy) {
                this.conns[i].isBusy = true;
                this.conns[i].startTime = tm;
                cb(this.conns[i])                
                return;
            }
        }
        var me = this;
        
        if(this.conns.length < this.poolConnections) {
            var db = me.newConnection(function(conn) {
                db.isBusy = true;
                db.startTime = tm;                
                me.conns.push(db);              
                cb(db);
            })
        } else {        
            setTimeout(function() {
                me.getConnection(cb)
            }, me.waitTime)
        }
    },

    free: function(conn) {

        conn.isBusy = false;
        conn.startTime = 0;

        return true;
    },
    
    // Освобождаем подвисшие коннекты
    freeByTimeout: function() {
        var tm = new Date().getTime() - this.freeTimeout;
        if(this.debug) console.log('CONNECTIONS POOL  -------------');
        for(var i=0;i < this.conns.length; i++) {
            if(this.conns[i].isBusy && this.conns[i].startTime < tm) {
                this.conns[i].isBusy = false;
                this.conns[i].startTime = 0;                
            }
            if(this.debug) console.log(i, ':', (this.conns[i].isBusy? 'busy:' + this.conns[i].debugData.methodName+':'+this.conns[i].debugData.filePath+':'+this.conns[i].debugData.lineNumber:'free'));
        }        
    },
    
    showConns: function() {

        for(var i=0;i < this.conns.length; i++) {
            console.log(i, ':', (this.conns[i].isBusy? 'busy:' + this.conns[i].debugData.methodName+':'+this.conns[i].debugData.filePath+':'+this.conns[i].debugData.lineNumber:'free'));
        }        
    }
    
})

