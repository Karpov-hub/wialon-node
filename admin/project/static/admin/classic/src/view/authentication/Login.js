Ext.define("Admin.view.authentication.Login", {
  extend: "Admin.view.authentication.LockingWindow",
  xtype: "pageslogin",

  requires: [
    "Admin.view.authentication.Dialog",
    "Ext.container.Container",
    "Ext.form.field.Text",
    "Ext.form.field.Checkbox",
    "Ext.button.Button"
  ],

  title: D.t("Wialon Report System"),
  defaultFocus: "authdialog", // Focus the Auth Form to force field focus as well

  items: [
    {
      xtype: "authdialog",

      autoComplete: true,
      //defaultButton : 'loginButton',
      bodyPadding: "20 20",
      cls: "auth-dialog-login",
      header: false,
      width: 415,
      layout: {
        type: "vbox",
        align: "stretch"
      },

      defaults: {
        margin: "5 0"
      },

      items: [
        {
          xtype: "label",
          text: D.t("Login.signTitle")
        },
        {
          xtype: "label",
          text: D.t("Login.error"),
          style: {
            color: "red",
            visibility: "hidden"
          },
          id: "login_error"
        },
        {
          xtype: "textfield",
          cls: "auth-textbox",
          name: "userid",
          bind: "{userid}",
          enableKeyEvents: true,
          height: 55,
          hideLabel: true,
          allowBlank: false,
          emptyText: D.t("Login.login"),
          triggers: {
            glyphed: {
              cls: "trigger-glyph-noop auth-email-trigger"
            }
          }
        },
        {
          xtype: "textfield",
          cls: "auth-textbox",
          height: 55,
          hideLabel: true,
          emptyText: D.t("Login.password"),
          inputType: "password",
          name: "password",
          bind: "{password}",
          enableKeyEvents: true,
          allowBlank: false,
          triggers: {
            glyphed: {
              cls: "trigger-glyph-noop auth-password-trigger"
            }
          }
        },
        /*{
          xtype: "container",
          layout: "hbox",
          items: [
            {
              xtype: "checkboxfield",
              flex: 1,
              cls: "form-panel-font-color rememberMeCheckbox",
              height: 30,
              bind: "{persist}",
              boxLabel: D.t("Login.rememberMe")
            },
            {
              xtype: "box",
              html:
                '<a href="#Admin.view.authentication.PasswordReset" class="link-forgot-password"> ' +
                D.t("Login.forgotPassword") +
                "</a>"
            }
          ]
        },*/
        {
          xtype: "button",
          reference: "loginButton",
          scale: "large",
          ui: "soft-green",
          iconAlign: "right",
          iconCls: "x-fa fa-angle-right",
          text: D.t("Login.enter"),
          formBind: true,
          listeners: {
            click: "onLoginButton"
          }
        } /*,
                {
                    xtype: 'box',
                    html: '<div class="outer-div"><div class="seperator">OR</div></div>',
                    margin: '10 0'
                },
                {
                    xtype: 'button',
                    scale: 'large',
                    ui: 'soft-blue',
                    iconAlign: 'right',
                    iconCls: 'x-fa fa-facebook',
                    text: 'Login with Facebook',
                    listeners: {
                        click: 'onFaceBookLogin'
                    }
                },
                {
                    xtype: 'box',
                    html: '<div class="outer-div"><div class="seperator">OR</div></div>',
                    margin: '10 0'
                },
                {
                    xtype: 'button',
                    scale: 'large',
                    ui: 'gray',
                    iconAlign: 'right',
                    iconCls: 'x-fa fa-user-plus',
                    text: 'Create Account',
                    listeners: {
                        click: 'onNewAccount'
                    }
                }*/
      ]
    }
  ],

  initComponent: function() {
    this.addCls("user-login-register-container");
    this.callParent(arguments);
  }
});
