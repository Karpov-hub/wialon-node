Ext.define("Admin.view.main.AbstractContainer", {
  extend: "Ext.container.Container",
  layout: "fit",
  listeners: {
    activate: function(me) {
      var h =
        Object.getPrototypeOf(me).$className +
        (me.recordId ? "~" + me.recordId : "");
      if (h != location.hash) {
        __NO_HASH_GO__ = true;
        location.hash =
          Object.getPrototypeOf(me).$className +
          (me.recordId ? "~" + me.recordId : "");
      }
    }
  },

  initComponent: function() {
    this.callParent(arguments);
    //this.closeOld();
  },

  closeOld: function() {
    var me = this;
    setTimeout(function() {
      var topPanel = me.ownerCt;
      if (!topPanel) {
        me.closeOld();
        return;
      }
      if (topPanel.itemId == "contentPanel" && topPanel.items.length > 1) {
        for (var i = topPanel.items.length - 1; i >= 0; i--) {
          if (topPanel.items.items[i].id != me.id)
            topPanel.remove(topPanel.items.items[i]);
        }
      }
    }, 500);
  }
});
