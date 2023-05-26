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
                Ext.create('Ext.Img',{
                src: '/admin/i/gerb.png',
                width: 200
            }),{
                xtype: 'panel',
                layout: {
                    type: 'vbox',
                    align: 'center',
                    pack: 'center'
                },
                items: this.items
            },Ext.create('Ext.Img',{
                src: '/admin/i/hiv_logo.png',
                width: 200
            })]
        }]
        this.callParent(arguments)
    }
});
