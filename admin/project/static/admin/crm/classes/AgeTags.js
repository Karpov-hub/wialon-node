Ext.define('Crm.classes.AgeTags', {
    extend: 'Ext.form.field.Tag',
    
    labelText: D.t('Age groups'),
    store: Ext.create('Ext.data.ArrayStore', {
        fields: ['name'],
        data: [
            ['0-1'],
            ['1-5'],
            ['6-14'],
            ['15-19'],
            ['20-24'],
            ['25-29'],
            ['30-34'],
            ['35-39'],
            ['40-44'],
            ['45-49'],
            ['50-54'],
            ['55-59'],
            ['60+']
        ]
    }),
    displayField: 'name',
    valueField: 'name',
    queryMode: 'local',
    name: 'age',
    forceSelection: false,
    autocomplete: 'off',
    createNewOnEnter: true,
    //typeAhead   : true,
    //filterPickList: true,
    //enableKeyEvents: true,
    initComponent: function() {
        var me = this;
        this.listeners = {
              afterrender:function(combo){
                  var me = this,
                  values = me.getValueRecords();
                  me.inputEl.set({'placeholder': values.length ? '' :me.labelText});
              },
              change:function(tag){
                    var me = this,
                  values = me.getValueRecords();
                  if(!!me.inputEl) me.inputEl.set({'placeholder': values.length ? '' :me.labelText});
              }
        }
        this.callParent(arguments)
    }
})