Ext.define("Crm.modules.cards.view.CardsForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Card") + ": {card_number}",
  iconCls: "x-fa fa-credit-card",
  controllerCls: "Crm.modules.cards.view.CardsFormController",

  buildItems: function() {
    return [
      {
        name: "id",
        xtype: "textfield",
        readOnly: true,
        fieldLabel: D.t("Unique Identificator")
      },
      {
        name: "card_number",
        xtype: "textfield",
        readOnly: true,
        fieldLabel: D.t("Card number")
      },
      {
        name: "organization_id",
        xtype: "textfield",
        readOnly: true,
        fieldLabel: D.t("Owner card")
      },
      {
        name: "organization_aggregator_account_id",
        xtype: "textfield",
        readOnly: true,
        fieldLabel: D.t("Account of Aggregator")
      },
      {
        name: "maker",
        xtype: "textfield",
        readOnly: true,
        fieldLabel: D.t("Maker")
      },
      {
        xtype: "xdatefield",
        name: "ctime",
        fieldLabel: D.t("Created time"),
        format: D.t("d.m.Y H:i:s O"),
        flex: 1,
        readOnly: true
      }
    ];
  },

  buildButtons: function() {
    const btns = [
      "->",
      { text: D.t("Close"), iconCls: "x-fa fa-ban", action: "formclose" }
    ];
    return btns;
  }
});
