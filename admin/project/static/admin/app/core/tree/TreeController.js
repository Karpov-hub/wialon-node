Ext.define('Core.tree.TreeController', {
    extend: 'Core.grid.GridController'
    
    ,setControls: function() {
        var me = this;
        this.control({
            '[action=add]'    : {click: function(el) {me.addRecord() }},
            '[action=refresh]': {click: function(el) {me.reloadData()}},
            '[action=import]' : {click: function(el) {me.importData()}},
            "tree": {
                cellkeydown: function(cell, td, i, rec, tr, rowIndex, e, eOpts) {
                    if(e.keyCode == 13) {
                        me.gotoRecordHash(rec.data)
                    }
                },
                celldblclick: function(cell, td, i, rec) {
                    me.gotoRecordHash(rec.data)
                },
                itemcontextmenu: function(vw, record, item, index, e, options){                
                     e.stopEvent();
                     //if(win.menuContext) {
                     //    win.menuContext.record = record;
                     //    win.menuContext.showAt(e.pageX, e.pageY);
                     //}
                }
            }
        })
        this.view.on('add', function(grid, node) {
            me.addRecord(node.id)
        })
        this.view.on('edit', function(grid, indx) {
            me.gotoRecordHash(grid.getStore().getAt(indx).data)
        })
        this.view.on('delete', function(grid, rec) {
            me.deleteRecord(grid.getStore(), rec)
        })
        //this.view.on('modify', function(id) {alert();me.modify(id)})
    }
    
    ,addRecord: function(pid) {
        var me = this;
        var d = {}
        if(!!me.view.observe) {
            var x = me.view.up('form')
            if (x) {
                me.view.observe.forEach(function (itm) {
                    var e = x.down('[name=' + itm.param + ']')
                    if (e)
                        d[itm.property] = e.getValue()
                })
            }
        }
        me.view.model.getNewObjectId(function(_id) {
            window.__CB_REC__ = d;
            if(!pid) {
                var sel = me.view.getSelection()
                pid = sel && sel.length? sel[0].data[me.view.model.idField] : null
            }  
            if(pid) {
                window.__CB_REC__.pid=pid
            }
            var oo = {}
            oo[me.view.model.idField] = _id
            me.gotoRecordHash(oo)
        })   
        
    }
    
    ,deleteRecord: function(store, rec) {
        var me = this;
        D.c('Removing', 'Delete the record?',[], function() {
            me.view.model.remove([rec.data[me.view.model.idField]], function() {
                rec.remove()
                //store.remove(rec, true)
            })
        })            
    }
    
    ,reloadData: function() {
        var me = this
            ,r = this.view.getRootNode()
            ,expanded = []
            ,store = this.view.store;
        
        var f = function(node) {
            node.childNodes.forEach(function(n) {
                if(n.isExpanded()) {
                    expanded.push(n.data[me.view.model.idField])
                    f(n)
                }
            })
        }
        f(r)
        
        store.load({
            node: r,
            callback: function() {
                me.reloadNode(r, expanded)    
            }
        })
        
        
    }
    
    ,reloadNode: function(node, expanded) {
        var me = this;
        node.childNodes.forEach(function(n) {
            if(expanded.indexOf(n.data[me.view.model.idField]) != -1) {
                n.expand(false, function() {
                    me.reloadNode(n, expanded)
                })
            }
        })    
    }

})