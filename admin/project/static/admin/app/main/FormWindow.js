/**
 * @author Vaibhav Mali
 * @Date : 19 March 2020
 */
Ext.define('main.FormWindow', {
    extend: 'Core.form.FormWindow'

    ,controllerCls:'main.FormController'

    ,buildButtons: function() {
        var btns = [
          "->",
          {
            text: D.t("Save and close"),
            iconCls: "x-fa fa-check-square-o",
            scale: "medium",
            action: "save"
          },
          { text: D.t("Save"), iconCls: "x-fa fa-check", action: "apply" },
          "-",
          { text: D.t("Close"), iconCls: "x-fa fa-ban", action: "formclose" }
        ];
        if (this.allowCopy)
          btns.splice(1, 0, {
            tooltip: D.t("Make a copy"),
            iconCls: "x-fa fa-copy",
            action: "copy"
          });
        return btns;
      }
        
})