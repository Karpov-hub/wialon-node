var sqlBuilder = require('json-sql');
var mongo = require('mongodb');

/**
 * @author Max Tushev <maximtushev@gmail.com>
 * @class Database.drivers.Oracle.Database
 * @extend: Database.drivers.Mysql.Database
 * The connector to Oracle database
 */
Ext.define("Database.drivers.Oracle.Database", {
    
    extend: 'Database.drivers.Mysql.Database'
    
    ,debugQuery: false
    ,debug: false
    // private
    ,constructor: function(cfg) {
        var me = this;
        
        if(cfg.debugQuery !== undefined ) this.debugQuery = cfg.debugQuery;
        if(cfg.debug !== undefined ) this.debug = cfg.debug;
        
        this.connect(cfg, cfg.callback) 
        this.callParent()
    }    
    
    ,connect: function(cfg, callback) {        
        if(!cfg) return;        
        var me = this
            ,ora = require("oracledb");  
        ora.poolMax = 40;            
        ora.getConnection(cfg, function(err, conn) {
            if(err)
                me.error(err)    
            else {
                me.conn = conn
                
                // Включим регистро-независимость в запросах
                conn.execute('ALTER SESSION SET NLS_COMP=LINGUISTIC',[],function() {
                    conn.execute('ALTER SESSION SET NLS_SORT=BINARY_CI',[],function() {
                        if(!!callback)
                            callback(conn)
                    })
                })
                
                
            }
        });
    }

    ,getCollections: function(callback) {
        var me = this;
        me.conn.execute("select table_name,table_type from cat where table_type in ('TABLE','VIEW') and table_name not like 'BIN\$%'", function(err, res) {
           
            if(res) { 
                res.rows.each(function(item) {
                    return item[0].toLowerCase()
                },true)            
                callback(res.rows)
            } else callback([])
        })
    }
    
    ,queryBuild: function(cfg) {
        if(cfg.fields && Ext.isObject(cfg.fields)) {
            var qFields = []
            for(var i in cfg.fields) if(cfg.fields[i] == 1) qFields.push(i)
            cfg.fields = qFields
        }
        
        var offset = 0, limit;
        
        if(cfg.limit) {
            limit = cfg.limit;
            delete cfg.limit;
        }
        if(cfg.offset || cfg.offset === 0) {
            offset = cfg.offset;
            delete cfg.offset;
        }

        var res = sqlBuilder(cfg)
        
        out = []
        for(var i in res.values) {
            if(Ext.isBoolean(res.values[i]))
                out.push(res.values[i]? 1:0)
            else
                out.push(res.values[i])    
        }
        res.query = res.query.replace(/\$p/g,':')
        res.query = res.query.replace(/(\W)_id/g, '$1"_id"')
        
        //res.query = this.prepFieldsNamesInQuery(res.query);
        
        res.values = out
        res.query = res.query.slice(0,-1)
        if(limit) {
            res.query = 'SELECT a.* FROM (SELECT b.*, rownum b_rownum FROM (' + res.query + ') b WHERE rownum <= ' + (offset + limit) + ') a WHERE b_rownum >= ' + offset
        }

//console.log('res:', res)
        
        return res
    }
    
                
    ,createCollection: function(collection, callback) {
        var me = this;
        [
            function(call) {
                me.conn.execute([
                    'CREATE table ":1" (',
                    '"_ID"        NUMBER,',
                    '"MTIME"      NUMBER,',
                    '"CTIME"      NUMBER,',
                    '"REMOVED"    NUMBER,',
                    'constraint  "TEST_PK" primary key ("_ID")'    
                ].join(), [collection], function(e, d) {
                    if(e) 
                        me.error(e)
                    else
                        call()
                })
            }
            ,function(call) {
                me.conn.execute('CREATE sequence ":1"', [collection + '_SEQ'], function(e,d) {
                    if(e) 
                        me.error(e)
                    else
                        call()
                })
            }
            ,function() {
                me.conn.execute([
                    'CREATE trigger ":1"',  
                    '  before insert on ":2"',              
                    '  for each row ',
                    'begin ', 
                    '    select ":3".nextval into :NEW._ID from dual;',
                    'end;'
                ],['BI_' + collection, collection, collection + '_SEQ'], function(e,d) {
                    if(e) 
                        me.error(e)
                    else
                        callback()
                })
            }
        ].runEach()
    }
    
    ,createObjectId: function(collection, cb) {
        cb(new mongo.BSONPure.ObjectID() + '')
    }  
    
    ,prepFieldsNamesInQuery: function() {
        
    }
    
    ,checkCollection: function(model, callback) {
        if(!!callback) callback()
    }

    ,getData: function(collection, find, fields, sort, start, limit, callback) {
        var me = this
            ,fieldsAr = []
            ,cfg = {
                type: 'select',
                table: collection,
                condition: find                
            };
            
        [
            // get counts
            function(call) {
                cfg.fields = ["count(*) as cnt"]
                var res = me.queryBuild(cfg)
                me.conn.execute(res.query, res.values, function(e, data) {
                    if(data && data.rows && data.rows[0] && data.rows[0][0]) 
                        call(data.rows[0][0])    
                    else
                        callback(0, [])
                })
            }
            
            ,function(total) {
                cfg.fields = fields
                if(sort) cfg.sort = sort
                if(limit) cfg.limit = limit
                if(start || start === 0) cfg.offset = start
                //var res = me.queryBuild(cfg)
//console.log('get data:', cfg)
                me.collection(cfg.collection).query(cfg, function(err, res) {
                    if(me.debug && err) {
                        console.log('Database getData err:', err)
                        console.log('getData res:', cfg)     
                    }
                    callback(total, res)
                })
                
                /*me.conn.query(res.query, res.values, function(e, data) {
                    if(data) {
                        callback(total, data)
                    }
                })*/
            }
        ].runEach();
    }
    
    ,query: function(query, values, callback) {
        var me = this;
        var stream = this.conn.queryStream(query, values);
        var meta = [], result = [], blobs = [];

        if(this.debugQuery) {
            console.log('\n----------query--------\n',  query, '\n----------values--------\n')
            console.log(values)
            console.log('\n----------end query--------\n')
        }
        
        stream.on('error', function (error) {
            
            if(me.debug) {
                console.log('query:', query)
                console.log('values:', values)
                console.log('error:', error)
                console.trace()
                //throw new Error('Oracle');
            }
            
            callback(error);
            return;
        });
        stream.on('metadata', function (metadata) {
            metadata.forEach(function(m) {
                if(m.name == m.name.toUpperCase())
                    meta.push(m.name.toLowerCase())
                else    
                    meta.push(m.name);
            })
        });
        stream.on('data', function (data) {
            var o = {}, blob = [], i;
            meta.forEach(function(m,i) {
                if(data[i] && !!data[i].setEncoding) {
                    blob.push(m);
                }
                o[m] = data[i];
            });
            i = result.push(o);
            if(blob.length) {
                blobs[i-1] = blob;
            }
        });

        stream.on('end', function () {   
            
            if(blobs && blobs.length) {
                var j = 0;
                blobs.prepEach(
                    function(b,nxt) {
                        j++;
                        if(b && result[j-1]) {
                            me.getBlobObjects(b, result[j-1], nxt);
                        } else {
                            nxt()
                        }                            
                    },
                    function() {
                        callback(null, result)
                    }
                )
            } else
                callback(null, result)
        });

    }
    
    ,getBlobObjects: function(blobFields, data, cb) {
        var me = this;
        blobFields.prepEach(
            function(b, nxt) {
                me.getBlobObject(data[b], function(res) {
                    data[b] = res;
                    nxt()
                })
                
            },
            function() {
                cb()
            }
        )
    }
    
    ,getBlobObject: function(data, cb) {
        if(!!data.setEncoding) {
            var body = '';
            data.setEncoding('utf8');
            data.on('data', function (chunk) {
                body += chunk;
            });
            data.on('end', function () {                
                var jsn;
                try {
                    jsn = JSON.parse(body)
                } catch(e) {jsn = null}
                if(jsn)
                    cb(jsn)
                else    
                    cb(body)
            });
        } else
        if(Ext.isString(data)) {
            var jsn;
            try {
                jsn = JSON.parse(data)
            } catch(e) {jsn = null}
            if(jsn)
                cb(jsn)
            else    
                cb(body)
        } else
            cb(data)
    }
    
    
})