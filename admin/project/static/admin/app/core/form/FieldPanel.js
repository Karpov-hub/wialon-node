Ext.define('Desktop.core.form.FieldPanel',{
    extend: 'Ext.panel.Panel'
    ,alias: 'widget.fieldpanel'

    ,mixins: {
        field: 'Ext.form.field.Field'        
    }
    
    ,changeContent: function(elms) {
        this.value = this.getValue();
        this.removeAll(this);
        this.add(elms);
        this.setValue(this.value)
    }
        
    ,setValue: function(value) {
        var el;
        this.value = value;        
        if(value) {
            for(var i in value) {
                el = this.down('[fname=' + i + ']');
                if(el) el.setValue(value[i])
            }
        }        
    }

    ,getValue: function() {
        var els = this.query('[fname]'),out = {};
        els.forEach(function(f) {
            out[f.fname] = f.getValue();;
        })
        return out;
    }

    ,getSubmitData: function() {
        var res = {}
        res[this.name] = this.getValue()
        return res
    }
})