'use strict';
Ext.define("Database.drivers.Mongodb.Transactions", {

    extend: 'Database.drivers.Mongodb.Database'    
    
    ,txCollection: 'Transactions'
    
    ,txCleanTimeout: 30000 // timeout for rollback broken transactions (milliseconds)
    
    ,constructor: function(cfg) {
        this.db = cfg.scope;  
        this.type = 'nosql'
        this.name = 'mongodb'
        this.fieldTypes = this.db.fieldTypes ;
    }
    
	,start: function (collections) {
        var _this = this;
		return new Promise((resolve, reject) => {		
			_this.db.collection(_this.txCollection).insert({
				dt: new Date().getTime(),
				cl: collections,
				st: 1
			}, function(e,d) {

				if(d && d[0]) {
					_this._id = d[0]._id
					_this.collections = collections
                    resolve(_this)				
				} else {
				   reject(e)
				}
			})
		})
	}	
	
	,collection: function(name) {
        var coll = this.db.collection(name);
        
        coll.insert = this._insert(name)
        coll.update = this._update(name)
        coll.remove = this._remove(name)               
        
        return coll;  
    }

	,_insert(coll) {
	    var me = this;
        return function(data, p1, p2) {
            data.tx = me._id
            return me.db.collection(coll).insert(data, p1, p2)	    
	    }
	}
	
	,_update(coll) {
        var me = this;
        
        return function(query, data, cb) {
  
            var fields = me._getFields(data) 
                ,cl = me.db.collection(coll)
                ,i = 0;      
            if(!data.$set)	data.$set = {}   
	        data.$set.tx = me._id;
	        cl.find( query, fields).each(function(err, doc) {
                if(doc) { 
                    i++;
                    data.$set.txOptions = me._setOldData(doc, data)
                    if(data.$inc) {
                        for(var i in data.$inc) 
                            if(data.$set[i] !== undefined) delete data.$set[i];
		            }
                    cl.update({ _id: doc._id }, data, function(e, d) { 
			            if(e) console.log('tx update:', e)
                    });
                } else {
                    cb(err, i)                
                }
            });
        }
	}
	
	,_remove(coll) {
	    var me = this;
        return function(query, p1, p2) {
            me.db.collection(coll).update(query, {
                $set: {
                    removed: true,
                    tx: me._id               
                }            
            }, p1, p2)	    
	    }
	}
	
	,_getFields: function(data) {
        var out = {_id: 1}
        if(data.$set) {
            for(var i in data.$set) out[i] = 1;        
        }	
        return out;
	}
	
	,_setOldData: function(oldDoc, data) {
	    var out = {}
	    if(data.$set && Object.keys(data.$set).length !== 0) {
            for(var i in data.$set) if(i != 'tx') out[i] = oldDoc[i];        
        }
        if(data.$inc && Object.keys(data.$inc).length !== 0) {
            out.__inc__ = data.$inc;                   
        } else
        if(data.$inc && Object.keys(data.$inc).length === 0)
            delete data.$inc;
        return out;
	}
	
	,commit: function () {
//console.log('commit')	    
		var me = this;
		return new Promise((resolve, reject) => {
		    me._save(function(txObject) {
		        me._fin(txObject, resolve, reject)
		    }, reject)
		})
	}
	
	,_save: function(cb, reject) {
        var me = this;  

//process.exit()      
              
        this.db.collection(me.txCollection)
        .findAndModify(
            {_id: this._id}, 
            {},
            {$set: {st: 2}},
            {},
            function(e, d) {                                 
                if(e) {
                    reject(e)
                } else cb(d)
            }
         )
	}
	
	,_fin: function(txObject, cb, reject) {
	    var me = this;

	    txObject.cl.prepEach(
            function(collName, next) {
                me.db.collection(collName).update({tx: me._id},{$unset: {tx: "", txOptions: ""}}, {multi: true}, function(e,d) {
                     if(e) reject(e)
                     else next();    
                })
            },
            function() {
                me.db.collection(me.txCollection) 
                .remove({_id: me._id}, function(e, d) {                                       
                    if(e) reject(e)
                    else {
                        cb()
                    }
                })          
            }	    
	    )
	}
	
	,rollback: function(cb) {
//console.log('rollback')
        this.rollback_new(this._id, this.collections, cb)        	
	}
	
	,rollback_new: function(txId, collections, cb) {
        var me = this, log = true;        
        collections.prepEach(function(coll, next) {
            if(!coll) {
                next();
                return;            
            }            
            me.rollbackRecordsNewStatus(txId, coll, function(err) {
                if(err) log = false;
                next()
            })
        },function() {
            if(log) {
                me.db.collection(me.txCollection).remove({_id: txId}, function(){
                    if(!!cb) cb()    
                })            
            } else
                if(!!cb) cb()
        })       	
	}
	
	,rollbackRecordsNewStatus: function(txId, coll, next) {
        var me = this, 
            cl = this.db.collection(coll);            
        cl.find({tx: txId}, {_id:1, txOptions: 1}).each(function(err, doc) {            
            if(doc) {
                if(doc.txOptions) {
                    var data = me.getRollbackData(doc.txOptions)                                
                    data.$unset = {txOptions: "", tx: ""}                
                    cl.update({ _id: doc._id }, data, function() {});                
                } else
                    cl.remove({ _id: doc._id }, function(){});
            } else {
                next(err)            
            }
        });	
	}
	
	,getRollbackData: function(txOptions) {
	   var out = {}
	   for(var i in txOptions) {
	       if(i == '__inc__') {
	           out.$inc = this.unInc(txOptions[i])
	       } else {
	           if(!out.$set) out.$set = {}
	           out.$set[i] = txOptions[i]
	       }
	   }
	   return out;
	}

    ,unInc: function(data) {
        for(var j in data) {
            data[j] *= -1;        
        } 
        return data;   
    }	

    ,startCleanProcess: function() {
        var me = this;        
        setTimeout(function() {
            me.cleanAll(function() {
                me.startCleanProcess()    
            })
        }, this.txCleanTimeout)    
    }	
	
	,cleanAll: function(cb) {
	    var me = this;	    
	    var cursor = me.db.collection(me.txCollection).find({
            dt: {$lte: (new Date().getTime() - me.txCleanTimeout)}	    
	    },{_id: 1, cl: 1, st: 1}, {cursor:{batchSize: 1000}});	  

	    var readData = function() {
            cursor.nextObject(function(e,d) {
                if(d) {
                    me.cleanOne(d, function() {
                        readData()    
                    })
                }
                else
                    cb()
            })
        }
        readData()	    
	}
	
	,cleanOne: function(tx, cb) {
        if(tx.st == 1) {
            this.rollback_new(tx._id, tx.cl, cb)
        } else {
            this.fix_saved(tx._id, tx.cl, cb)
        }	
	}
	
	,fix_saved: function(txId, collections, cb) {
        var me = this;        
        collections.prepEach(
            function(col, next) {
                if(!col) {
                    next()
                    return;                
                }
                me.db.collection(col).update({tx: txId}, {$unset: {tx: "", txOptions: ""}}, function(){
                    next()    
                })
            },
            function() {
                me.db.collection(me.txCollection).remove({_id: txId}, function(){
                    cb()    
                })
            }        
        )	
	}
	
});
