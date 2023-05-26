Ext.define('Core.form.DateField', {
    extend: 'Ext.form.field.Date',

    alias: 'widget.xdatefield',
    
    format: D.t('d.m.Y'),
    
    submitFormat: 'm/d/Y', 
    
    setValue: function() {
        if(arguments[0]) arguments[0] = new Date(arguments[0])
        this.callParent(arguments)
    }
})