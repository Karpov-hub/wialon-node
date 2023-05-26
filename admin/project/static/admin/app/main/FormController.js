/**
 * @author Vaibhav Mali
 * @Date : 19 March 2020
 */
Ext.define('main.FormController', {
    extend: 'Core.form.FormController'  


    ,setControls: function() {
        var me = this;
        me.view.changeArr = [];                
        this.control({
            '[action=formclose]': {click: function(el) {me.gotoListView();}},
            '[action=apply]': {click: function(el) {
                __CONFIG__.formSave=true;
                me.save(false)
            }},
            '[action=save]': {click: function(el) {
                __CONFIG__.formSave=true;            
                me.save(true)
            }},
            '[action=refreshFormData]': {
                click: function(el) {
                    me.refreshFormData();
                } 
             },
            '[action=remove]': {click: function(el) {me.deleteRecord_do(true)}},
            '[action=copy]': {click: function(el) {me.copyRecord(true)}},
            '[action=gotolist]': {click: function(el) {me.gotoListView()}}
        })
        this.view.on('activate', function(grid, indx) {
            if(!me.oldDocTitle)
                me.oldDocTitle = document.title
        })
        me.view.on('save', function (a, b, c) {
            me.view.changeArr = [];  
            me.view.changeFlag = false;
        }) 
        this.view.on('close', function(grid, indx) {
            if(me.oldDocTitle) document.title = me.oldDocTitle
         })
        this.view.down('form').on({
            validitychange: function ( th , valid , eOpts ) {
                var el = me.view.down('[action=apply]');
                if(el) el.setDisabled(!valid)
                el = me.view.down('[action=save]');
                if(el) el.setDisabled(!valid)
            }
        })
        this.checkPermissions()
     }
    
    ,save: function(closewin, cb) {
        var me = this,
            form = me.view.down('form').getForm(),
            data = {},formData={};
        
        var sb1 = me.view.down('[action=save]')
            ,sb2 = me.view.down('[action=apply]')
        
        if(sb1 && !!sb1.setDisabled) sb1.setDisabled(true)
        if(sb2 && !!sb2.setDisabled) sb2.setDisabled(true)
        
        if(form) {
            data = form.getValues(); 
            formData=data;
        }
        
        var setButtonsStatus = function() {
            if(sb1 && !!sb1.setDisabled) sb1.setDisabled(false)
            if(sb2 && !!sb2.setDisabled) sb2.setDisabled(false)
        }

        if(me.view.fireEvent('beforesave', me.view, data) === false) {
            setButtonsStatus();
            return;
        }
        if(me.view.down('[action=refreshFormData]')){
            me.model.runOnServer("checkMtime",{id:data.id,mtime:data.mtime},function(mTimeFlag){
                if(mTimeFlag){
                    D.a(D.t('Record Modified Error'),D.t('Record has modified please refresh form and then save it.'))
                    me.view.down('[action=apply]').setDisabled(false)
                    return;
                }else{
                    me.model.write(data, function(data, err) {
                        if(data && data.record && data.record.signobject && data.record.signobject.shouldSign)
                            me.view.addSignButton(data.record.signobject)
                        
                        setButtonsStatus()
                        if(err) {
                            me.showErrorMessage(err)//win, err)
                            return;
                        }
                        else if(data && data.error){
                            D.a('Error',(data.error && data.error.message)? 
                            data.error.message:"Something went wrong.");
                        }
                        else if(data.validationErrors){
                            var errorHtml="";
                            errorHtml="<table border=\"1\"><tr><th>field</th><th>Error</th></tr>";
                            data.validationErrors.forEach(error =>{
                                errorHtml+="<tr><td>"+error.field+"</td><td>"+error.message+"</tr>";
                            })
                            errorHtml+="</table>";
                            D.a('Validations Errors:',errorHtml);
                        }
                        else{
                            D.a('Success','Action completed successfully.');
                        }
                        if(me.view.fireEvent('save', me.view, data) === false) {
                            if(!!cb) cb(data)
                            return;
                        }
                        if(closewin && !!me.view.close && !data.error && !err && !data.validationErrors) 
                            me.view.close()
                                        
                        if(!!cb) cb(data)
                    })  
                }
            })
        }else{
            me.model.write(data, function(data, err) {
                if(data && data.record && data.record.signobject && data.record.signobject.shouldSign)
                    me.view.addSignButton(data.record.signobject)
                
                setButtonsStatus()
                if(err) {
                    me.showErrorMessage(err)//win, err)
                    return;
                }
                else if(data && data.error){
                    D.a('Error',(data.error && data.error.message)? 
                    data.error.message:"Something went wrong.");
                }
                else if(data.validationErrors){
                    var errorHtml="";
                    errorHtml="<table border=\"1\"><tr><th>field</th><th>Error</th></tr>";
                    data.validationErrors.forEach(error =>{
                        errorHtml+="<tr><td>"+error.field+"</td><td>"+error.message+"</tr>";
                    })
                    errorHtml+="</table>";
                    D.a('Validations Errors:',errorHtml);
                }
                else{
                    D.a('Success','Action completed successfully.');
                }
                if(me.view.fireEvent('save', me.view, data) === false) {
                    if(!!cb) cb(data)
                    return;
                }
                if(closewin && !!me.view.close && !data.error && !err && !data.validationErrors) 
                    me.view.close()
                                
                if(!!cb) cb(data)
            })  
        }
    }

    ,refreshFormData:function(){
        var me=this;
        var fm = me.view.down('form');
        var params={
            filters:[
                {property:'id',value:(fm&&fm.config&&fm.config.$initParent&&fm.config.$initParent.recordId)?(fm.config.$initParent.recordId):window.location.hash.split('~')[1]}
            ]
        }
        me.model.runOnServer('getData',params, function (res) {
            if(res&&res.list&&res.list.length){
                me.view.down('form').getForm().setValues(res.list[0]); 
            }
        })
    }
    
})