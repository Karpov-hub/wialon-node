/**
 * @class Core.data.Store
 * @extend Ext.data.Store
 * @private
 * @author Max Tushev <maximtushev@gmail.ru>
 * 
 * Yode data store base class.
 * 
 *     @example *     
 *     var store = Ext.create('Core.data.Store',{
 *         dataModel: 'My.Model.Class.Name',
 *         scope: window, // Specify a link to window there this store is used
 *         fieldSet: ['_id', 'name'] // List the fields that you need
 *     })
 */
Ext.define('Core.data.Store', {
    extend: 'Ext.data.Store',
    //sorters: 'level',
    //filters: [],
    /*
    requires: [
        'Ext.grid.*',
        'Ext.data.*',
        'Ext.util.*'        
    ],
      */  
    //buffered: true,
    //leadingBufferZone: 50,
    pageSize: 25,  
    autoLoad: false,
    
    isDataReady: false,

      
    constructor: function(options) {                
        
        //Ext.apply(this, options)
        
        this.exProxyParams = options.exProxyParams;
       
        if(options.autoLoad === undefined) options.autoLoad = true;
        
        if(!options) options = {}

        this.wsModel = Ext.create('Ext.data.Model', {
             fields: this.initModel({
                dataModel: options.dataModel || this.dataModel,
                fieldSet: options.fieldSet || this.fieldSet
            })
        });
        //options.data = []
        
        options.remoteSort = true;
        //options.remoteGroup = true;
        options.remoteFilter = true;
        
        if(options.groupField) {
            this.groupField = options.groupField
            //options.remoteGroup = false;
        }
             
        this.wsProxy = this.createProxy({
            dataModel: options.dataModel || this.dataModel,
            fieldSet: options.fieldSet || this.fieldSet
        });
        
        if(options.scope) 
            this.scope = options.scope;
        
        this.initDataGetter(options);        
        this.callParent(options);
    }
    

    
    /**
     * @method
     * @private
     * Setting up proxy and reader
     * @param {Object} options
     */ 
    ,initDataGetter: function(options) {
        var me = this, log = true;                    
        setTimeout(function() {
            me.setModel(me.wsModel)
            me.setProxy(me.wsProxy)
            //me.createReader()
            //if(me.autoLoad) {
            me.on('load', function(q) {
                if(log) {
                    log = false;
                    me.isDataReady = true;   
                    me.fireEvent('ready', me, options);                    
                }
            })
            if(options.autoLoad !== false) {                
                me.load();
            }
            
                //}
        }, 100)                
        me.dataActionsSubscribe()
    }
    
    /**
     * @method
     * @private
     * Model initialisation
     * @param {Object} options
     */
    ,initModel: function(options) {
        var me = this
            ,modelPath
            ,fields = []
        
        me.id = 'store-' + (new Date()).getTime()+Math.random();
       
        if(options.dataModel) {
            if(Ext.isString(options.dataModel)) {
                me.dataModel = Ext.create(options.dataModel)
                me.modelPath = options.dataModel
            } else {    
                me.dataModel = options.dataModel
                me.modelPath = Object.getPrototypeOf(options.dataModel).$className
                
            }
        }
        
        if(options.fieldSet) {
            if(Ext.isString(options.fieldSet))
                options.fieldSet = options.fieldSet.split(',')
            fields = [{name: me.dataModel.idField}] 
            
            for(var i=0;i<options.fieldSet.length;i++) 
                fields.push({name: options.fieldSet[i]})
        } else {
            fields = options.dataModel.fields.items
        }
        return fields;
    }
    
    /**
     * @method
     * @private
     * @param {Object} options
     */
    ,createProxy: function(options) {
        var me = this
            ,params = Ext.apply((me.exProxyParams || {}), {
                model: me.modelPath,
                scope: me.id,
                fieldSet: options.fieldSet   
            });
        return Ext.create('Ext.ux.data.proxy.WebSocket',{
            storeId: me.id,
            websocket: Glob.ws,
            params: params,
            reader: {
                 type: 'json',
                 rootProperty: 'list'
                 ,totalProperty: 'total'
                 ,successProperty: 'success'
            },
            simpleSortMode: true
            ,filterParam: 'query'
            ,remoteFilter: true
        })
    }
    
    ,createProxyParams: function() {
        return {}    
    }
    
    /**
     * @method
     * @private
     */
    ,createReader: function() {
        var p = this.getProxy();
        p.setReader(Ext.create('Ext.data.reader.Json', {
             rootProperty: 'list'
             ,totalProperty: 'total'
             ,successProperty: 'success'
        }))
    }
    /*
    ,createFiltersCollection: function() {
        var x = this.getData();
        if(!!x.getFilters) return x.getFilters()
        return Ext.create('Ext.util.FilterCollection', {filters: []});
    }
    
    ,createSortersCollection: function() {
        var x = this.getData();
        if(!!x.getSorters) return x.getSorters()
        return Ext.create('Ext.util.Sorter', {property: '_id'});
    }
    */
    /**
     * @method
     * Subscribing this store to the server model events
     */
    ,dataActionsSubscribe: function() {
        var me = this
            ,wid = (me.scope? me.scope.id: me.modelPath);
        
        if(me.scope) {
            // remove subscription when window is closed
            me.scope.on('destroy', function() {
                Glob.ws.unsubscribe(wid)    
            })        
        }
        Glob.ws.subscribe(wid, me.modelPath, function(action, data) {
            me.onDataChange(action, data)
        })
    }
    
    /**
     * @method
     * This method fires when the model data has been changed on the server
     * @param {String} action one of ins, upd or remove
     * @param {Object} data
     */
    ,onDataChange: function(action, data) {
        var me = this
        if(!Ext.isArray(data)) data = [data]
        switch(action) {
            case 'ins'   : me.insertData(data);break;
            case 'upd'   : me.updateData(data);break;
            case 'remove': me.removeData(data);break;
        }   
    }
    
    /**
     * @method
     * The action for inserting
     * @paramn {Object} data
     */
    ,insertData: function(data) {        
        this.reload({
            callback: function(records, operation, success) {
                this.fireEvent('insertdataload', this, records)
            }
        })
    }
    
    /**
     * @method
     * The action for updating
     * @paramn {Object} data
     */
    ,updateData: function(data) {        
        var rows = this.data.items;
        for(var i=0;i<rows.length;i++) {
            for(var j=0;j<data.length;j++) {
                if(rows[i].data[this.dataModel.idField] == data[j][this.dataModel.idField]) {
                    for(var k in rows[i].data) {
                        if(data[j][k] != undefined && data[j][k] != rows[i].data[k]) rows[i].data[k] = data[j][k]
                    }
                    rows[i].commit()
                    break;
                }
            }
        }
    }
    
    /**
     * @method
     * The action for removing
     * @paramn {Object} data
     */
    ,removeData: function(data) { 
        this.reload()
    }
});