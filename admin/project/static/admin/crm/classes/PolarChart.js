Ext.define('Crm.classes.PolarChart', {
    extend: 'Ext.chart.PolarChart',    
    
    width: '100%',
    height: 400,
    innerPadding: 40,

    background: 'rgba(255, 255, 255, 1)',
    interactions: ['itemhighlight', 'rotatePie3d'],
    colors: [
        'rgba(199, 144, 103, 0.6)',
        'rgba(103, 144, 199, 0.6)',                
        '#ee929d',
        '#6ADCCE',
        '#74DC6A',
        '#DC6ADC'
    ],

    legend: {
        //width: 300,
        docked: 'bottom'
        //,renderer: function(a,b,c) {console.log(a,b,c);return '111';}
    },
    series: [
        {
            type: 'pie3d',
            highlight: {
                margin: 20
            },
            label: {
                
                field: 'activity',
                display: 'under',
                contrast: true,
                font: '11px Arial'
            },
            useDarkerStrokeColor: false,
            xField: 'count',
            donut: 50,
            padding:50
        }
    ]
    ,interactions: [{
        type: 'rotate'
    }]
    
    ,rebuildGroupedAxis: function(data) {
        var me = this;
        me.store.each(function(d) {
            d.data.activity = d.data.activity.replace(' ('+d.data.count+')','')
            if(me.showLables)
                d.data.activity  += ' ('+d.data.count+')';
            d.commit()
        })
    }
    
})