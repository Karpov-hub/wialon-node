Ext.define('main.MainToolbar', {
    extend: 'Ext.container.ButtonGroup',
    
    viewModel: Ext.create('main.MainToolbarViewModel'),
    
    requires: __CONFIG__.defaultRequires,
     
    //width: '100%',
    cls: 'maintoolbar-cls',
    
    items: [/*{
            xtype: 'label',
            style: 'font-weight: normal;font-size: 16px;font-family: OpenSans,verdana,arial;',
            margin: '0 10 0 0',
            flex:1,
            text: 'ООО "Золотой пятачек"'
            //html: '<img src="/admin/i/logo.png" />'
        },*/{
            cls: 'delete-focus-bg',
            iconCls:'x-fa fa-envelope-o message-offline',
            href: '#Crm.modules.messages.view.MessagesGrid',
            hrefTarget: '_self',
            tooltip: D.t('Messages'),
            width: 40,
            bind: {
                iconCls: 'x-fa fa-envelope-o message-{newMsg}',
                text: '{msgCount}',
                tooltip: D.t('New messages: {msgCount}')
            }
        },{
            cls: 'delete-focus-bg',
            width: 35,
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
        
    ,initComponent: function() {
        this.on({render: () => {
            setTimeout(() => {
                this.up('mainviewport').controller.onToggleNavigationSize() 
            }, 1000)
        }})
        this.callParent(arguments)
    }
})

