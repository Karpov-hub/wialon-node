Ext.define("Crm.modules.requestToRegistration.view.RequestToRegistrationForm", {
  extend: "Core.form.FormWindow",
  controllerCls:
    "Crm.modules.requestToRegistration.view.RequestToRegistrationFormController",
  titleTpl: "Request to registration: {company}",

  buildItems: function() {
    return [
      {
        name: "id",
        hidden: true
      },
      {
        name: "name",
        fieldLabel: D.t("Name"),
        readOnly: true
      },
      {
        name: "company",
        fieldLabel: D.t("Company"),
        readOnly: true
      },
      {
        name: "realm_id",
        hidden: true
      },
      {
        name: "realm_to_show",
        fieldLabel: D.t("Realm"),
        readOnly: true
      },
      {
        name: "lang",
        fieldLabel: D.t("Lang"),
        readOnly: true
      },
      {
        name: "website",
        fieldLabel: D.t("Website")
      },
      {
        name: "email",
        fieldLabel: D.t("Email"),
        readOnly: true
      },
      {
        name: "is_wialon_accounts_exists",
        hidden: true
      },
      {
        name: "is_wialon_accounts_exists_to_show",
        fieldLabel: D.t("Is wialon accounts exists?"),
        readOnly: true
      },
      {
        name: "wishes",
        fieldLabel: D.t("What tasks is user plan to solve with Repogen?"),
        readOnly: true,
        xtype: "textarea",
        height: 100
      },
      {
        name: "phone_number",
        fieldLabel: D.t("Phone number"),
        readOnly: true
      },
      {
        name: "status",
        hidden: true
      },
      {
        name: "status_to_show",
        readOnly: true,
        fieldLabel: D.t("Status of approve")
      },
      {
        xtype: "textarea",
        name: "reject_reason",
        fieldLabel: D.t("Reject reason"),
        readOnly: true,
        height: 100,
        hidden: true
      }
    ];
  },
  buildButtons: function() {
    return [
      {
        text: D.t("Approve"),
        iconCls: "x-fa fa-check",
        action: "approve",
        scale: "medium"
      },
      "-",
      {
        text: D.t("Reject"),
        iconCls: "x-fa fa-times",
        action: "reject",
        scale: "medium"
      },
      "->",
      {
        text: D.t("Close"),
        iconCls: "x-fa fa-ban",
        action: "formclose",
        scale: "medium"
      }
    ];
  }
});
