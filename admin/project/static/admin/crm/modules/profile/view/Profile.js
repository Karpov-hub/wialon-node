Ext.define('Crm.modules.profile.view.Profile', {
    extend: 'Admin.view.main.AbstractContainer',
    
    requires: [
        'Ext.ux.layout.ResponsiveColumn'
    ],

    id: 'profile',

    layout: 'fit'
    
    ,controller: Ext.create('Core.form.FormController')
    ,model: 'Crm.modules.profile.model.ProfileModel'
    
    ,initComponent: function() {
        this.recordId = localStorage.getItem('uid');   
        this.items = [{
            title: D.t('profile'),
            xtype: 'form',
            tbar: this.buildButtons(),
            defaults: {
                //margin: '5'
                xtype: 'panel'                
            },
            //region: 'center',
            layout: 'responsivecolumn',
            border: false,
            items: [
                this.buildFormFolders(),
                this.buildPhotoBlock()
                
            ]
        }]
        //this.buttons = this.buildButtons()
        this.callParent(arguments);
        
    }
    ,buildPhotoBlock: function() {
        return {
            //title: '',
            collapsible: false,
            defaultType: 'textfield',
            defaults: {
                anchor: '100%',
                margin: '5'
            },
            layout: 'anchor',
            responsiveCls: 'big-40 small-100',
            items:[Ext.create('Crm.modules.profile.view.Photo', { 
                hideLibel: true,
                name: 'photo'
            })]
        }
    }
    
    ,buildFormFolders: function() {
        return {
            //title: '',
            responsiveCls: 'big-60 small-100',
            //columnWidth: 1,
            collapsible: false,
            defaultType: 'textfield',
            defaults: {
                anchor: '100%',
                msgTarget: 'under',
                margin: '5'
            },
            layout: 'anchor',
            items:[
            {
                name: 'login',
                busyText: D.t('This login name is busy!'),
                fieldLabel: D.t('Login')
            },{
                name: 'pass',
                inputType: 'password',
                fieldLabel: D.t('Password')
            },
            {
                name: 'name',
                fieldLabel: D.t('Name')
            },
            {
                name: 'phone',
                fieldLabel: D.t('Phone')
            },
            {
                name: 'email',
                fieldLabel: D.t('Email')
            },
            {
                name: 'email_sign',
                xtype: 'textarea',
                height: 80,
                fieldLabel: D.t('Signature in the letters')
            },{
                name: '_id',
                hidden: true
            }
            
            ]
        }
    }
    
    ,buildButtons: function() {
        return [
            {text: D.t('Save'), iconCls: 'x-fa fa-check', scale: 'medium', action: 'apply'}
        ]    
    }
    
})