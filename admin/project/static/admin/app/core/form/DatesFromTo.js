Ext.define('Core.form.DatesFromTo',{
    extend: 'Ext.form.FieldContainer'
    ,alias: 'widget.datesfromto'
    
    ,mixins: {
        field: 'Ext.form.field.Field'
    }
    
    ,requires: [
        'Ext.form.field.Date'
    ]
    
    ,layout: 'hbox'
    
    ,labels: {
        from: 'Date from',
        to  : 'Date to'
    }
    
    ,format: 'd/m/Y'
    //,getValueFormat: 'Y-m-d'
    
    ,initComponent: function() {
        this.items = [
            this.buildDateField('from'),
            this.buildDateField('to')
        ]
        
        this.callParent(arguments);
        var me = this;
        this.down('[fname=from]').on('change', function() {me.validateValues(1)})
        this.down('[fname=to]').on('change', function() {me.validateValues(2)})
        
        if(me.value) {
            me.setValue(me.value)
        }
    }
    
    ,buildDateField: function(name) {
        return {
            xtype: 'datefield',
            fname: name,
            flex:1,
            format: this.format,
            isFormField:false,
            emptyText: this.labels[name]
        }
    }
    
    ,setValue: function(value) {

        if(value) {
            if(value.from !== undefined) 
                this.down('[fname=from]').setValue(new Date(value.from))
            if(value.to !== undefined) 
                this.down('[fname=to]').setValue(new Date(value.to))
            
        }
    }

    ,getValue: function() {
        var out = null
            ,d1 = this.down('[fname=from]').getValue()
            ,d2 = this.down('[fname=to]').getValue();
        
        if(this.getValueFormat) {
            d1 = Ext.Date.format(d1, this.getValueFormat);
            d2 = Ext.Date.format(d2, this.getValueFormat);
        }
        
        if(d1 || d2) {
            out = {}
            out[this.name] = {}
            if(d1) out[this.name].from = d1;
            if(d2) out[this.name].to = d2;
        }
        
        return out;
    }

    ,getSubmitData: function() {
        return this.getValue();
    }
    
    ,validateValues: function(fld) {
        var out = null
            ,d1f = this.down('[fname=from]')
            ,d2f = this.down('[fname=to]')
            ,d1 = d1f.getValue()
            ,d2 = d2f.getValue();
            
        if(d1 || d2) {
            if(d1>d2 || d2<d1) {
                if(fld === 1) {
                    d2f.setValue(d1);
                } else {
                    d1f.setValue(d2);
                }
            }
        } 
        this.fireEvent('change', this, this.getValue())
    }

    
})