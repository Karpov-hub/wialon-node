Ext.define('main.MainToolbar', {
    extend: 'Ext.container.ButtonGroup',
    
    viewModel: Ext.create('main.MainToolbarViewModel'),

    flex: 10,     
    
    items: [{
            xtype: 'label',
            style: 'font-weight: bold;font-size: 20px;font-family: OpenSans,verdana,arial;',
            margin: '0 50 0 0',
            html: '<nobr>Republic of Zimbabwe | Ministry of Health and Child Welfare | HIV Macro Database</nobr>'
        },/*{
            cls: 'delete-focus-bg',
            iconCls:'x-fa fa-envelope-o message-offline',
            href: '#Crm.modules.messages.view.MessagesGrid',
            hrefTarget: '_self',
            tooltip: D.t('Messages'),
            bind: {
                iconCls: 'x-fa fa-envelope-o message-{newMsg}',
                text: '{msgCount}',
                tooltip: D.t('New messages: {msgCount}')
            }
        },*/{
            cls: 'delete-focus-bg',
            bind: {
                iconCls: 'x-fa fa-server status-{status}',
                tooltip: '{status}'
            }
        },/*{
            cls: 'delete-focus-bg',
            iconCls:'x-fa fa-th-large',
            href: '#Crm.modules.profile.view.Profile',
            hrefTarget: '_self',
            tooltip: D.t('See your profile')
        },*/
        {
            //xtype: 'tbtext',
            bind: {
                text: '{user.login}'    
            },
            href: '#Crm.modules.profile.view.Profile',
            hrefTarget: '_self',
            cls: 'top-user-name'
        },
        {
            xtype: 'image',
            cls: 'header-right-profile-image',
            height: 35,
            width: 35,
            href: '#Crm.modules.profile.view.Profile',
            hrefTarget: '_self',
            bind: {
                src: '{user.photo}'    
            },
            alt: D.t('current user image')
        }
        ],
        
    initComponent: function() {
        var me = this;
        this.getMainMenuStore(function(store) {
            me.buildReportsBranch(store)
        })
        this.callParent(arguments)
    }   
    
    ,getMainMenuStore: function(cb) {
        var me = this;
        setTimeout(function() {
            var store = Ext.getStore('NavigationTree')
            if(!store) 
                me.getMainMenuStore(cb)
            else    
                store.on('nodeinsert', function(a,b,c) {
                    if(b.data.text == 'Enquiries and Reports') {
                        me.buildReportsBranch(b)
                    }
                })
        }, 100)
    }
    
    ,buildReportsBranch: function(b) {        
        var me = this;
        Ext.create('Crm.modules.dashboard.model.DashboardModel')
        .getAllowedReportsSections(function(list) {
            var cls = Ext.create('Crm.modules.dashboard.view.Dashboard',{noUI: true});
            cls.sections.forEach(function(section) {
               if(list[section.name]) {
                   b.appendChild({
                       text: section.title,
                       leaf: true,
                       iconCls: section.iconCls || null,
                       view: 'Crm.modules.dashboard.view.Dashboard~' + section.name,
                       routeId: 'Crm.modules.dashboard.view.Dashboard~'+section.name
                   })
               } 
            })
            
            me.checkPassword()
            
        })
    }
    
    ,checkPassword: function() {
        Ext.create('Crm.modules.users.model.UsersModel')
        .checkPassword(function(res) {
            if(res && res.needsChange) Ext.create('Crm.modules.users.view.ChangePasswordWindow');
        })
    }
    
    
})

/**
 * This class provides the modal Ext.Window support for all Authentication forms.
 * It's layout is structured to center any Authentication dialog within it's center,
 * and provides a backGround image during such operations.
 */
Ext.define('Admin.view.authentication.LockingWindow', {
    extend: 'Ext.window.Window',
    xtype: 'lockingwindow',

    cls: 'auth-locked-window',

    closable: false,
    resizable: false,
    autoShow: true,
    titleAlign: 'center',
    maximized: true,
    modal: true,
    frameHeader: false,
	frame:false,
      header: {
        padding: 0,
        margin: 0,

        html: '<div class="custom-login-title">' +
        '<div class="coat-of-arms"></div>'+
        '<div class="login-title">Republic of Zimbabwe | Ministry of Health and Child Welfare | HIV Macro Database</div>' +
        '<div class="hiv-logo"></div>'+
        '</div>'
    },
    layout: {
        type: 'hbox',
        align: 'center',
        pack: 'center'
    },
	
    
    initComponent: function() {
        this.items = [{
            xtype: 'panel',
            layout: {
                type: 'hbox',
                align: 'center',
                pack: 'center'
            },
            items: [
            //      Ext.create('Ext.Img',{
            //     src: '/images/hiv-logo-5.png',
            //      align: 'center',
            //      width: 200,
            //      height: 200
            //  }),
                {
                xtype: 'panel',
                layout: {
                    type: 'vbox',
                    align: 'center',
                    pack: 'center'
                },
                items: this.items
            }
            // ,Ext.create('Ext.Img',{
            //     src: '/admin/i/hiv_logo.png',
            //     align: 'center',
            //     width: 200,
            //     height: 200
            // })
            ]
        }]
        this.callParent(arguments)
    }
});

Ext.define('Admin.view.authentication.Login', {
    extend: 'Admin.view.authentication.LockingWindow',
    xtype: 'pageslogin',

    requires: [
        'Admin.view.authentication.Dialog',
        'Ext.container.Container',
        'Ext.form.field.Text',
        'Ext.form.field.Checkbox',
        'Ext.button.Button'
    ],

    title: '',// D.t('Login.title'),
    defaultFocus: 'authdialog', // Focus the Auth Form to force field focus as well
    
   
    items: [
        {
            xtype: 'authdialog',
            
            autoComplete: true,
            defaultButton : 'loginButton',
            bodyPadding: '20 20',
            cls: 'auth-dialog-login',
            header: false,
            width: 415,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },

            defaults : {
                margin : '5 0'
            },

            items: [

                {
                    xtype: 'label',
                    text: D.t('Login.error'),
                    style: {
                        color: 'red',
                        visibility: 'hidden'
                    },
                    id: 'login_error'
                },
                {
                    xtype: 'textfield',
                    cls: 'auth-textbox',
                    name: 'userid',
                    bind: '{userid}',
                    height: 55,
                    hideLabel: true,
                    allowBlank : false,
                    emptyText: D.t('Login.login'),
                    triggers: {
                        glyphed: {
                            cls: 'trigger-glyph-noop auth-email-trigger'
                        }
                    }
                },
                {
                    xtype: 'textfield',
                    cls: 'auth-textbox',
                    height: 55,
                    hideLabel: true,
                    emptyText: D.t('Login.password'),
                    inputType: 'password',
                    name: 'password',
                    bind: '{password}',
                    allowBlank : false,
                    triggers: {
                        glyphed: {
                            cls: 'trigger-glyph-noop auth-password-trigger'
                        }
                    }
                },
                {
                    xtype: 'button',
                    reference: 'loginButton',
                    scale: 'large',
                    ui: 'soft-green',
                    iconAlign: 'right',
                    iconCls: 'x-fa fa-angle-right',
                    text: D.t('Login.enter'),
                    formBind: true,
                    listeners: {
                        click: 'onLoginButton'
                    }
                }
            ]
        }
    ],

    initComponent: function() {
        this.addCls('user-login-register-container');
        this.callParent(arguments);
    }
});
