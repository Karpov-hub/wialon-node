Ext.define('Desktop.core.widgets.TagField',{
    extend: 'Ext.form.field.Tag'
    ,alias: 'widget.xtagfield'

    ,setValue: function(value) {
        var me = this;
        if(value && value.length && !me.store.getCount()) {
            setTimeout(function() {me.setValue(value)}, 500)
            return;
        }
        return this.callParent(arguments)
    }

})
