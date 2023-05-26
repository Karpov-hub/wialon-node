Ext.define('Admin.view.main.ViewportController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.mainviewport',

    listen : {
        controller : {
            '#' : {
                unmatchedroute : 'onRouteChange'
            }
        }
    },

    routes: {
        ':node': 'onRouteChange'
    },
    
    connectWs: function() {
        var id = localStorage.getItem('uid')
            ,token = localStorage.getItem('token');
        
        if(id && token) {        
            var uriArr = location.href.split('/')
                ,host = uriArr[2]
                ,protocole = uriArr[0] == 'https:'? 'wss':'ws';
            Glob.ws = Ext.create('Core.WSockets', {
                url: protocole + "://" + host + "/?token=" + encodeURIComponent(token) + "&id=" + id ,
                protocol: "yode-protocol",
                communicationType: 'event'
            })
            return !!Glob.ws;
        }
        return false
    },

    setCurrentView: function(hashTag) {
        
        if(hashTag == 'authentication.login')
            hashTag = 'Admin.view.authentication.Login';
        
        //if(__NO_HASH_GO__) {
        //    __NO_HASH_GO__ = false;
        //    return;
        //}
        if((hashTag == 'authentication.login' || hashTag == 'Admin.view.authentication.Login') && localStorage.getItem('uid') && localStorage.getItem('token')) {
            localStorage.removeItem('uid', '');
            localStorage.removeItem('token', '');
            window.location = './'
            return;
        }
        
        if(hashTag !== 'authentication.login' && hashTag !== 'Admin.view.authentication.Login' && hashTag !='Admin.view.authentication.PasswordReset' && !Glob.ws && !this.connectWs())
            this.redirectTo('Admin.view.authentication.Login');        
            
        hashTag = (hashTag || '').split('~');
        
        var recordId = hashTag[1]
        hashTag = hashTag[0];        

        var me = this,
            refs = me.getReferences(),
            mainCard = refs.mainCardPanel,
            mainLayout = mainCard.getLayout(),
            navigationList = refs.navigationTreeList,
            viewModel = me.getViewModel(),
            vmData = viewModel.getData(),
            store = navigationList.getStore(),
            node = store.findNode('routeId', hashTag),
            view = node ? node.get('view') : null,
            lastView = vmData.currentView,
            existingItem = mainCard.child('component[routeId=' + hashTag + ']'),
            newView;
        
        if(!view) {
            view = hashTag;    
        }
         
        if (lastView && lastView.isWindow) {
            lastView.destroy();
        }
        
        if(recordId && existingItem && existingItem.recordId != recordId) {
            mainCard.remove(existingItem)            
            existingItem = null;
        }

        lastView = mainLayout.getActiveItem();
        
        var next = function() {
            if (!newView || !newView.isWindow) {
                if (existingItem) {
                    if (existingItem !== lastView) {
                        mainLayout.setActiveItem(existingItem);
                    }
                    newView = existingItem;
                }
                else {
                    Ext.suspendLayouts();
                    mainLayout.setActiveItem(mainCard.add(newView));
                    Ext.resumeLayouts(true);
                }
            }
    
            navigationList.setSelection(node);
    
            if (newView.isFocusable(true)) {
                newView.focus();
            }
    
            vmData.currentView = newView;  

        }
        
        
        if (!existingItem) {  
            var loadDiv = document.getElementById('loadDiv')
            loadDiv.style.display = 'block'
            loadDiv.style.zIndex = 10000;
            setTimeout(function() {
                newView = Ext.create((view || 'Admin.view.pages.Error404Window'), {
                    hideMode: 'offsets',
                    routeId: hashTag,
                    recordId: recordId,
                    listeners: {
                        afterrender: function() {
                            loadDiv.style.display = 'none';    
                        }    
                    }
                });               
              
                next()
            }, 100)
        } else
            next()
    },

    onNavigationTreeSelectionChange: function (tree, node) {
        if (node && node.get('view')) {
            this.redirectTo( node.get("routeId"));
        }
    },

    onToggleNavigationSize: function () {
        var me = this,
            refs = me.getReferences(),
            navigationList = refs.navigationTreeList,
            wrapContainer = refs.mainContainerWrap,
            collapsing = !navigationList.getMicro(),
            new_width = collapsing ? 64 : 250;

        if (Ext.isIE9m || !Ext.os.is.Desktop) {
            Ext.suspendLayouts();

            refs.senchaLogo.setWidth(new_width);

            navigationList.setWidth(new_width);
            navigationList.setMicro(collapsing);

            Ext.resumeLayouts(); // do not flush the layout here...

            // No animation for IE9 or lower...
            wrapContainer.layout.animatePolicy = wrapContainer.layout.animate = null;
            wrapContainer.updateLayout();  // ... since this will flush them
        }
        else {
            if (!collapsing) {
                // If we are leaving micro mode (expanding), we do that first so that the
                // text of the items in the navlist will be revealed by the animation.
                navigationList.setMicro(false);
            }

            // Start this layout first since it does not require a layout
            refs.senchaLogo.animate({dynamic: true, to: {width: new_width}});

            // Directly adjust the width config and then run the main wrap container layout
            // as the root layout (it and its chidren). This will cause the adjusted size to
            // be flushed to the element and animate to that new size.
            navigationList.width = new_width;
            wrapContainer.updateLayout({isRoot: true});

            // We need to switch to micro mode on the navlist *after* the animation (this
            // allows the "sweep" to leave the item text in place until it is no longer
            // visible.
            if (collapsing) {
                navigationList.on({
                    afterlayoutanimation: function () {
                        navigationList.setMicro(true);
                    },
                    single: true
                });
            }
        }
    },

    onMainViewRender:function() {
        if (!window.location.hash) {
            this.redirectTo("authentication.login");
        }
    },

    onRouteChange:function(id){
        this.setCurrentView(id);
    },

    onSearchRouteChange: function () {
        this.setCurrentView('search');
    },

    onEmailRouteChange: function () {
        this.setCurrentView('email');
    }
});
