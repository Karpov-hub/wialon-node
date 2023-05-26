Ext.define('Crm.modules.settings.view.DbDumpFormController', {
    extend: 'Core.form.FormController'
    
    ,setControls: function() {
        
        this.control({
            //'[action=clean]': {click: (el) => {this.cleanAffiliation()}},
            
        })

        this.callParent(arguments)
    }
    
    
    
    ,save: function(params) {
        
        const pass = this.view.down('[name=pass]').getValue();
        
        if(!pass) {
            D.a('Ошибка', 'Укажите пароль к базе данных');
            return;
        }
        
        document.getElementById('loadDiv').style.display = '';
        this.view.hide()
        
        this.model.makeDbDump(pass, (data) => {
            document.getElementById('loadDiv').style.display = 'none';
            if(data && data.file) {
                this.view.close()
                location = '/Crm.modules.settings.model.DbDumpModel.dwl/?file=' + encodeURIComponent(data.file) + '&name=DB_DUMP_'+Ext.Date.format(new Date(),'d-m-y')+'.sql';
                history.go(-1);
            } else {
                this.view.show()
            }
        })
        
    }

})