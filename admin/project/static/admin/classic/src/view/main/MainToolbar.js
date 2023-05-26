Ext.define('Admin.view.main.MainToolbar', {
    extend: 'Ext.container.Container',    
    //controller: 'maintoolbar',

    viewModel: Ext.create('Admin.view.main.MainToolbarViewModel'),
    
    layout: 'hbox',
    border: false,
    //cls: 'sencha-dash-dash-headerbar toolbar-btn-shadow',
    
    defaults: {xtype: 'button'},
    
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
        },
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
            alt: D.t('current user image')
        }]
})