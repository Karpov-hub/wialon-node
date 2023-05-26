Ext.define('Crm.classes.GroupedAxis', {
    extend: 'Ext.chart.axis.Category',
  
    config: {
        //label: {
        //    fontSize: 100
        //},                
        renderer: function(axis, data) {                     
            return ' '
        },
        position: 'bottom'
    }
    
  
    
    
    
});