Ext.define('main.TopToolbar', {
    extend: 'Ext.container.ButtonGroup',
    
    viewModel: Ext.create('main.TopToolbarModel'),
                
    items: [{
            cls: 'delete-focus-bg',
            bind: {
                iconCls: 'x-fa fa-server status-{status}',
                tooltip: '{status}'
            }
        },{
            cls: 'delete-focus-bg',
            iconCls:'x-fa fa-th-large',
            href: '#Crm.modules.profile.view.Profile',
            hrefTarget: '_self',
            tooltip: D.t('See your profile')
        },
        {
            xtype: 'tbtext',
            bind: {
                text: '{user.name}'    
            },
            cls: 'top-user-name'
        },
        {
            xtype: 'image',
            cls: 'header-right-profile-image',
            height: 35,
            width: 35,
            bind: {
                src: '{user.photo}'    
            },
            alt: D.t('current user image')
        }
        ]
})