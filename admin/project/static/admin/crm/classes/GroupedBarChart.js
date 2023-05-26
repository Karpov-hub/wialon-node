Ext.define('Crm.classes.GroupedBarChart', {
    extend: 'Ext.chart.CartesianChart'
    
    ,minWidth: 600
    ,minHeight: 10
    ,sectionWidth: 60
    ,barWidth: 10
    ,showLables: false
    ,tooltipWidth: 200
    
    ,correctingWidth: 0
    
    ,labelRotation: {
        degrees: 90
    }
    
    ,groupLabelsStyles: [{
        fontSize: 10,
        //rotate: {
        //    degrees: -45
        //},
        fillStyle: '#404040'
    },{
        fontSize: 11,
        fillStyle: '#404040'
    },{
        fontSize: 11,
        fillStyle: '#404040'
    },{
        fontSize: 11,
        fillStyle: '#404040'
    },{
        fontSize: 11,
        fillStyle: '#404040'
    }]
    
    ,tooltipWidth: 200
    
    ,constructor: function() {    
        if(arguments[0].seriesCfg) 
            arguments[0].series = this.buildSeries(arguments[0].seriesCfg);        
        
        var me = this;
        
        for(var i = 0;i<arguments[0].series.length;i++) {
            arguments[0].series[i].tooltip = {
              trackMouse: true,
              seryIndex: i,
              width: arguments[0].tooltipWidth || this.tooltipWidth,
              renderer: function (toolTip, record, ctx) {
                  me.tooltipRenderer(toolTip, record, ctx)
              }
            }
        }
        
        this.callParent(arguments)
    }
    

    ,initComponent: function() {
        var me = this;

        if(Ext.isArray(this.tooltipTpl)) {
            for(var i=0;i<this.tooltipTpl.length;i++) {
                this.tooltipTpl[i] = new Ext.XTemplate(this.tooltipTpl[i]);
            }
        } else
            this.tooltipTpl = new Ext.XTemplate(this.tooltipTpl);
        
        this.callParent(arguments)
        var tm;
        this.scope.on({
            resize: function(a,w,h) {
                me.minWidth = w - 50;
                var hh = h - 50;
                if(hh < this.minHeight) hh = this.minHeight;
                me.setHeight(hh);
            },
            totalchanged: function(total) {
                if(!!me.scope.totalSprite) 
                     me.scope.totalSprite.setAttributes({text: 'Total:' + total})
            },
            setminwidth: function(width) {
                me.minWidth = width + 30;                
                me.redraw();
            }
        })
        //me.setHeight(this.scope.height-50);
        me.legendStatus = {}
        if(!!this.legend) {
            this.legend.on({
                itemclick: function(a,d,c,i) {
                    me.legendStatus[i] = !d.data.disabled;
                    me.rebuildGroupedAxis(me.store.getData())
                }
            })
        }
        this.on({
            redraw: function() {
                me.rebuildGroupedAxis(me.store.getData())
            }
        })
        setTimeout(function() {
            try {
                me.setHeight(me.scope.getHeight()-50);
            } catch(e) {}
        }, 100)
    }
    
    ,calculateWidth: function(records) {
        if(!this.surfaceMap) return;        
        var me = this
            ,srf = this.surfaceMap.axis[0]
            ,w = this.sectionWidth
            ,fullWidth = w * records.length;// + 2;

        if(fullWidth < this.minWidth) {
            fullWidth = this.minWidth;
        }   

        

        this.setWidth(fullWidth); 
        return fullWidth;
    }
    ,rebuildGroupedAxis: function(records) {    
        if(!this.surfaceMap) return;
       
        var me = this
            ,series = this.surfaceMap.series[0]
            ,srf = this.surfaceMap.axis[0]
            ,srf1 = this.surfaceMap.axis[1]
            ,w = this.sectionWidth
            ,dd = 76
            ,max = 0
            ,minWidth
            ,labels = this.config.axes[1].fields
            ,fullWidth = w * records.length;// + 2;
         
        try {
            minWidth = this.scope.getWidth() - 50 
        } catch(e) {
            minWidth = 200;
        }
         
        if(!!me.legend) me.getLegend().setStyle({left:'50px'})
 
        if(srf1.canvases && srf1.canvases[0]) {
            dd = srf1.canvases[0].dom.width + 20
        }
            
        if(minWidth < this.minWidth) 
             minWidth = this.minWidth
        if(fullWidth <  minWidth) {
            fullWidth = minWidth;
            if(records.length) {
                w = (fullWidth / records.length);
            }
        }   
 

        this.setWidth(fullWidth + this.correctingWidth);   

        if(!!this.scope.totalSprite && !this.scope.onDashboard)
            this.scope.totalSprite.setAttributes({x:fullWidth - 50});
        
        w = (fullWidth-dd)/records.length;        
        for(var i=srf._items.length-1;i>=0;i--) {
            if(!!srf._items[i].text || srf._items[i].type == 'line') {
                srf.remove(srf._items[i], true);
            } 
        }  
        for(var i=series._items.length-1;i>=0;i--) {
            if(!!series._items[i].text) {
                series.remove(series._items[i], true);
            } 
        }
        
        var x = w/2, prev = [0], sPrev, count, chartHeight;

      
        if(me.showLables) { 
            try {
                chartHeight = me.getHeight()- (me.scope.onDashboard? 190:290);
            } catch(e) {
                chartHeight = 200;
            }            
        
            records.items.forEach(function(item,i) {
                var t = 0;
                labels.forEach(function(l) {
                    if(me.totalLabel) 
                        t += item.data[l] || 0;
                    else
                        if(item.data[l] > max) max = item.data[l];
                })
                if(me.totalLabel && t>max) max = t;
            })
        }

        records.items.forEach(function(item,i) {
            var s = item.data[me.groupField].split(':')
            
            if(!i) {
                me.drawLine(srf,0,s.length-1);
            }
            
            if(!count) count = s.length;
                //,sPrev = i>0? records.items[i-1].data[me.groupField].split(':'):null;            
            me.addGroupedLabels(srf,s,sPrev,x,w,prev)
            
            if(me.showLables) me.addLabel(series, x, item, labels, max, chartHeight)
            
            x += w;
            sPrev = s;
        })       
        var er = [];
        for(var i=0;i<count;i++) er[i]='';
        me.addGroupedLabels(srf,er,sPrev,x,w,prev);        
    }
    
    ,addLabel: function(srf,x, item, labels, max, height) { 
        if(this.totalLabel)
            this.addTotalLabel(srf,x, item, labels, max, height)
        else
            this.addSeparateLabel(srf,x, item, labels, max, height)
    }
    
    ,addTotalLabel: function(srf,x, item, labels, max, height) {

        var me = this, y, total = 0;          
       
        for(var i=0;i<labels.length;i++) { 
            total += item.data[labels[i]] || 0;
        }

        y = 10 + (height? height * total / max : 35);

        srf.add({
            type: 'text',
            x: x,
            y: y<35? 35:y,
            scalingX: -1,
            text: total,
            rotation: me.labelRotation,
            textAlign: 'center'            
        })
    }
    
    ,addSeparateLabel: function(srf,x, item, labels, max, height) {
 
        var me = this, y, pos = x - (labels.length/2)*this.barWidth + 5;          
        for(var i=0;i<labels.length;i++) { 
            
            if(item.data[labels[i]] && this.legendStatus[i] !== false) {
                y = 10 + (height? height * item.data[labels[i]] / max : 35);
                
                //console.log(y)
                
                srf.add({
                    type: 'text',
                    x: pos,
                    y: y<35? 35:y,
                    scalingX: -1,
                    text: item.data[labels[i]],
                    rotation: me.labelRotation,
                    textAlign: 'center'            
                })
            }
            pos += this.barWidth;
        }
    }
    
    
    
    ,addGroupedLabels: function(srf,s,sPrev,x,w,prev) {
        var j = 0, log = true;
        for(var i = s.length-1;i>-1;i--) {
            if(!j) this.addLabelSprite(srf, s[i], x, j);
            else {
                if(prev[j] === undefined) {
                    prev[j] = {x:x, text:s[i]}
                } else
                if(prev[j].text !== s[i]) {
                    this.addLabelSprite(
                        srf, 
                        prev[j].text, 
                        prev[j].x + (x - prev[j].x)/2 - w/2, 
                        j
                     )
                     log = true;
                     for(var k = i-1;k>-1;k--) {
                        if(prev[s.length - k-1].text !== s[k]) log = false; 
                     }
                     if(log) this.drawLine(srf, x-w/2, j)
                     prev[j] = {x:x, text:s[i]}
                }
            }
            j++;
        }
    }
    
    ,addLabelSprite: function(srf, s, x, j) {
        var cfg = this.groupLabelsStyles[this.groupLabelsStyles[j]? j:0]
            ,y = 15;
        
        if(j) {
            for(var i=0;i<j;i++) {
                y += this.groupLabelsStyles[this.groupLabelsStyles[i]? i:0].fontSize + 5;
            }
        }  
        
        var spr = {
            type: 'text',
            x: x,
            y: y,
            text: s,            
            textAlign: 'center'            
        }
        
        for(var i in cfg) spr[i] = cfg[i];
            
        srf.add(spr)
    }
    
    ,drawLine: function(srf, x, j) {
        var l = 0;

        for(var i=0;i<=j;i++) {
            l += this.groupLabelsStyles[this.groupLabelsStyles[i]? i:0].fontSize + 5;
        }

        srf.add({
            type: 'line',
            fromX: x,
            fromY: 0,
            toX: x,
            toY: l,
            strokeStyle: 'black'
            //lineWidth: 0
        })
        
    }
    
    ,buildSeries: function(series) {
        var me = this, out = [];        
        series.items.forEach(function(s, i) {
            out.push(me.buildSery(s.dataIndex, s.title, s.color, i, series.itemBarsCount, series.itemBarWidth))
        })

        return out;
    }
    
    ,buildSery: function(field, title, color, j, n, bw) {
        var me = this;

        return {
            type: 'bar',
            //colors: [
            //    color
            //],
            style: {
                opacity: 0.6
            },
            //useDarkerStrokeColor: false,
            xField: 'x',
            yField: [
                field                                
            ],   
            title: title,            
            renderer: function(sprite, config, rendererData, index){ 
                var w = config.width;
                    config.width = bw;                    
                    config.x = config.x + w/2 - (n*bw/2) + bw*j; 
            },
            fill: true,
            smooth: true
        }
    }
    
    ,tooltipRenderer: function(toolTip, record, ctx) {
        var out = {val: ctx.record.data[ctx.field], valField: ctx.field}, tpl;
        var x = ctx.record.data[ctx.series._xField].split(':')
        if(ctx.record.data.meta) {
            ctx.record.data.meta.forEach(function(m,i) {
                out[m] = x[i];
            })
        }  
        
        if(Ext.isArray(this.tooltipTpl)) {
            tpl = this.tooltipTpl[toolTip.seryIndex || 0];
        } else
            tpl = this.tooltipTpl;
      
        toolTip.setHtml(tpl.apply(out));
    }
   
    
})