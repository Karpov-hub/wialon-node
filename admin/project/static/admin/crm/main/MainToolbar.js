Ext.define('main.MainToolbar', {
    extend: 'Ext.container.ButtonGroup',
    
    viewModel: Ext.create('main.MainToolbarViewModel'),
    
    requires: __CONFIG__.defaultRequires,
                
    items: [{
            cls: 'delete-focus-bg',
            iconCls:'backgroundprocess-0',
            tooltip: '',
            bind: {
                iconCls: 'backgroundprocess-{inProgress}',
                text: '{inProgressCount}',
                tooltip: D.t('In progress: {inProgressCount}')
            },
            handler: function() {
                Ext.create('Crm.modules.console.view.Console')
            }
        },{
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
        },{
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
                text: '{user.name}'    
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
            alt: D.t('current user image'),
            listeners: {
                el: {
                    click: function() {
                        location = '#Crm.modules.profile.view.Profile'
                    }
                }
            }
        }
        ]
})


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

    title: D.t('Login.title'),
    defaultFocus: 'authdialog', // Focus the Auth Form to force field focus as well
    frameHeader: false,
    
    //header: false, 

    layout: {
        type: 'hbox',
        align: 'center',
        pack: 'center'
    },
    
    //html: '<div class="mytestclass">blah-blah-blah</div>',
   
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
                    text: D.t('Login.signTitle')
                },
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