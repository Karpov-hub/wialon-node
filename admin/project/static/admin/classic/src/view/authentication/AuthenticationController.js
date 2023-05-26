Ext.define('Admin.view.authentication.AuthenticationController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.authentication',
    
    defaultRedirect: __CONFIG__.FirstRedirect,
    url: __CONFIG__.LoginUrl,

    //TODO: implement central Facebook OATH handling here
    constructor: function() {         
         localStorage.removeItem('uid', '');
         localStorage.removeItem('token', '');    
         this.callParent(arguments)
    },
    
    init: function(view) {
        this.control({
            '[name=userid]'    : {keydown: (a,b,c) => {this.onKeyPress(a,b,c) }},
            '[name=password]': {keydown: (a,b,c) => {this.onKeyPress(a,b,c)}}
        })
    },
    
    onKeyPress: function(a,b,c) {
        if(b.keyCode == 13) {
            this.onLoginButton()
        }
    },
    
    onFaceBookLogin : function(button, e) {
        //this.redirectTo("dashboard");
    },

    onLoginButton: function(button, e, eOpts) {        
        var me = this;        
        Ext.Ajax.request({
             url: me.url,
             params: {
                login: me.view.down('[name=userid]').getValue(),
                pass: me.view.down('[name=password]').getValue()   
             },
             success: function(response, opts) {
                 var obj = Ext.decode(response.responseText);
                 if(obj.response && obj.response.id && obj.response.token) {
                    localStorage.setItem('uid', obj.response.id);
                    localStorage.setItem('token', obj.response.token); 
                    me.successProcess(obj.response.id, obj.response.token)
                    me.redirectTo(obj.response.autorun || me.defaultRedirect);
                    me.view.down('#login_error').setStyle('visibility', 'hidden');
                 }
             },        
             failure: function(response, opts) {
                 me.view.down('#login_error').setStyle('visibility', 'visible');
             }
        });        
    },
    
    successProcess: function(id, token) {
        var uriArr = location.href.split('/')
            ,host = uriArr[2]
            ,protocole = uriArr[0] == 'https:'? 'wss':'ws';
        Glob.ws = Ext.create('Core.WSockets', {
            url: protocole + "://" + host + "/?token=" + encodeURIComponent(token) + "&id=" + id ,
            protocol: "yode-protocol",
            communicationType: 'event'
        })
    },

    onLoginAsButton: function(button, e, eOpts) {
        this.redirectTo("authentication.login");
    },

    onNewAccount:  function(button, e, eOpts) {
        this.redirectTo("authentication.register");
    },

    onSignupClick:  function(button, e, eOpts) {
        //this.redirectTo("dashboard");
    },

    onResetClick:  function(button, e, eOpts) {
        var me = this;
        Ext.create('Crm.modules.users.model.UsersModel')
        .resetPassword(me.view.down('[name=email]').getValue(), function(res) {
            if(res && res.success) {
                D.a('Pasword recovery', 'Instruction was sent to your email');
                me.redirectTo("authentication.login");
             } else {
                 if(res.message) D.a('Password recovery', res.message);
             }
        })
    }
});
