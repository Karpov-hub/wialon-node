
Ext.define('Crm.modules.wialonUsers.view.WialonUsersGrid', {
    extend: "main.GridContainer",

    title: D.t('Users'),
    iconCls: 'fa fa-info-circle',    
    requires: ['Core.grid.ComboColumn'],

    filterbar: true,
    filterable: false,
    autoscroll: true, 
    
    controllerCls:'Crm.modules.wialonUsers.view.WialonUsersGridController',
   
    buildColumns: function () {
        var me=this;
        return [
            {
                text: D.t("Name"),
                flex: 1,
                sortable: true,
                filter: {
                    xtype:'textfield',
                   // maskRe : /[A-Za-z]*$/
                },
                dataIndex: 'name',
                editor: {
                    xtype:'textfield',
                   // maskRe : /[A-Za-z]*$/,
                    allowBlank:false
                }
            },{
                text: D.t("Email"),
                flex: 1,
                sortable: true,
                filter: true,
                dataIndex: 'email'
            },{
                text: D.t("Role"),
                flex: 1,
                sortable: true,
                filter: true,
                dataIndex: 'role'
            },{
                text: D.t("Organization"),
                sortable: true,
                flex:1,
                filter: true,
                dataIndex: 'organization_name'
            },
            {
                text: D.t("Organization Id"),
                dataIndex: 'organization_id',
                hidden:true,
                hideable: false
            },
            {
                text: D.t("Role Id"),
                dataIndex: 'role_id',
                hidden:true,
                hideable: false
            },
            {
                text: D.t("Is Active?"),
                sortable: true,
                flex:1,
                dataIndex: 'is_active',
                filter:me.buildActiveCombo(),
                renderer:function(v){
                    return (v)?"Yes":"No";
                }
            },
            {
              text: D.t("Is Blocked By Admin?"),
              sortable: true,
              flex: 1,
              dataIndex: 'is_blocked_by_admin',
              filter: me.buildBlockedCombo(),
              renderer: function (v) {
                return (v) ? "Blocked" : "Not blocked";
              }
            },
          ]   
    }

    ,buildActiveCombo:function(){
        return  {
            xtype: 'combo',
            editable: false,   
            valueField: 'code',
            displayField: 'status',
            queryMode: 'local',
            anchor: '100%',  
            store: Ext.create('Ext.data.ArrayStore', {
                fields: ['code', 'status'],
                data: [[false,D.t('No')],[true,D.t('Yes')]]
            })
        }
    }
    ,buildBlockedCombo: function () {
      return {
        xtype: 'combo',
        editable: false,
        valueField: 'code',
        displayField: 'status',
        queryMode: 'local',
        anchor: '100%',
        store: Ext.create('Ext.data.ArrayStore', {
          fields: ['code', 'status'],
          data: [[true, D.t('Blocked')], [false, D.t('Not blocked')]]
        })
      }
    }


  ,buildButtonsColumns: function() {
    var me = this;
    return [
      {
        xtype: "actioncolumn",
        width: 54,
        menuDisabled: true,
        items: [
          {
            iconCls: "x-fa fa-pencil-square-o",
            tooltip: this.buttonEditTooltip,
            isDisabled: function() {
              return !me.permis.modify && !me.permis.read;
            },
            handler: function(grid, rowIndex) {
              me.fireEvent("edit", grid, rowIndex);
            }
          }
        ]
      }
    ];
  }


  , buildFormItems: function (request) {
    var me = this;
    return [
      {
        name: 'role_id',
        value: (request && request.role_id) ? request.role_id:"",
        hidden: true
      },
      me.buildOraganization("organization_id",(request && request.organization_id) ? request.organization_id:( (me && me.observeObject && me.observeObject.organization_id) ? me.observeObject.organization_id :""),request),
      {
        name: 'name',
        fieldLabel: D.t('Enter Name*'),
        value: (request && request.name) ? request.name:"",
        allowBlank: false
      },
      {
        name: 'email',
        fieldLabel: D.t('Enter Email*'),
        readOnly:request && request.id ? true :false,
        value: (request && request.email) ? request.email:"",
        validator: function (v) {
          var emailValidator = /^[a-zA-Z0-9]+[a-zA-Z0-9.!#$%&*+-/=?^_{|}~]*@[a-zA-Z0-9.-]+[a-zA-Z0-9]+\.[a-zA-Z]{2,10}$/;
          return emailValidator.test(v) ? true : 'Please enter email in proper format:user@example.com.';
        },
        allowBlank: false
      },
      {
        xtype: 'combo',
        fieldLabel: D.t('Is Active?*'),
        editable: false,
        name: 'is_active',
        value: (request && request.is_active!=undefined) ? request.is_active:true,
        valueField: 'code',
        displayField: 'status',
        queryMode: 'local',
        anchor: '100%',
        store: Ext.create('Ext.data.ArrayStore', {
          fields: ['code', 'status'],
          data: [[false, D.t('No')], [true, D.t('Yes')]]
        }),
        allowBlank: false
      },
      {
        xtype: 'combo',
        fieldLabel: D.t('Is Blocked By Admin?*'),
        editable: false,  
        value: (request && request.is_blocked_by_admin!=undefined) ? request.is_blocked_by_admin:false,
        name:'is_blocked_by_admin',
        valueField: 'code',
        displayField: 'status',
        queryMode: 'local',
        anchor: '100%',  
        store: Ext.create('Ext.data.ArrayStore', {
            fields: ['code', 'status'],
            data: [[false,D.t('Not blocked')],[true,D.t('Blocked')]]
        }),
        allowBlank:false
      },
      {
        name: 'pass',
        width: '100%',
        anchor: '100%',
        inputType: 'password',
        hidden: (request && request.id) ? false : true,
        fieldLabel: D.t('Enter Password')
      }
    ] 
  } 

  ,buildOraganization: function(name,value,request) {
    var me=this;
    this.oraganizationStore = Ext.create('Core.data.Store', {
        dataModel: Ext.create('Crm.modules.organizations.model.OrganizationsComboModel'),
        fieldSet: ['organization_name','id'],
        forceSelection: false,
        allowBlank: false,
        scope: this
    });
    return {
        xtype: 'combo',
        name: name?name:'organization_name',
        fieldLabel: D.t('Select Organization *'),
        displayField: 'organization_name',
        valueField: 'id',
        queryMode: 'remote',
        queryParam: 'query',
        triggerAction : 'query',
        typeAhead: true,
        value:value?value:"",
        minChars: 2,
        width:"100%",
        anyMatch: true,
        store: this.oraganizationStore,
        allowBlank:false,
        readOnly:me.organizationFlag?true:(request && request.id ? true :false),
        forceSelection : true
    }
}

})
