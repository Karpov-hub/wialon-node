Ext.define('Crm.modules.messages.model.BgProcessModel', {
    extend: "Core.data.DataModel"
    ,collection: 'bgprocess'
    ,removeAction: 'remove'
    ,fields: [{
        name: '_id',
        type: 'ObjectID',
        visible: true
    },{
        name: 'name',
        type: 'string',
        filterable: true,
        visible: true,
        editable: true
    }]
    
    /* scope:client */
    ,getBgCount: function(cb) {
        this.runOnServer('getBgCount',{}, cb)
    }
    
    /* scope:server */
    ,$getBgCount: function(data, cb) {
        this.src.db.collection(this.collection).find({},{})
        .toArray((e,d) => {
            cb({res: d})
        })
    }
    
    /* scope:server */
    ,startProcess: function(name, cb) {
        [
            (next) => {
                this.dbCollection.findOne({name: name},{_id:1},(e,d) => {
                    if(d)
                        return cb(false)
                    next()
                })
            },
            () => {
                this.write({name:name},() => {
                    cb(true)  
                }, {add:true})
            }
        ].runEach()
    }
    
    /* scope:server */
    ,stopProcess: function(name, cb) {
        [
            (next) => {
                this.dbCollection.findOne({name: name},{_id:1},(e,d) => {
                    if(!d)
                        return cb(false)
                    next(d)
                })
            },
            (d) => {
                this.remove([d._id],() => {
                    cb(true)  
                })
            }
        ].runEach()
    }
    
})