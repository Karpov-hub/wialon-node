Ext.define('main.ReportsMenuBranch', {
    extend: 'Ext.data.NodeInterface'
    
    text: 'Reports',
    iconCls: 'x-fa fa-bar-chart',
    
    constructor: function() {
        this.on('expand', function() {
            alert('expand')
        })
        this.callParent(arguments)
    }
    
    /*children: [{
        text: 'PLHIV Demographic Analysis',
        view: 'Crm.modules.reports.Demographic.view.Window',
        iconCls: 'x-fa fa-bar-chart'
    }]
    */
})