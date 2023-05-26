Ext.define("Core.window.Window", {
  extend: "Ext.window.Window",

  autoShow: true,
  modal: true,

  layout: "fit",

  listeners: {
    activate: function(me) {
      me.onActivate(me);
    },
    close: function(me) {
      me.onClose(me);
    }
  },

  onActivate: function(me) {
    if (me.noHash) return;
    var h =
      Object.getPrototypeOf(me).$className +
      (me.recordId ? "~" + me.recordId : "");
    if (h != location.hash) {
      __NO_HASH_GO__ = true;
      location.hash = h;
    }
  },

  onClose: function(me) {
    if (me.noHash) return;
    if (me.closeHash) location.hash = me.closeHash;
  },

  initComponent: function() {
    this.createCloseHash();
    this.callParent(arguments);
  },

  createCloseHash: function() {
    if (this.closeHash === undefined) {
      var h = Object.getPrototypeOf(this).$className;
      if (h.substr(-4) == "Form")
        this.closeHash = h.substr(0, h.length - 4) + "Grid";
    }
  },

  width: 200,
  height: 200,

  afterRender: function() {
    var me = this;

    me.callParent(arguments);

    me.syncSize();

    // Since we want to always be a %age of the viewport, we have to watch for
    // resize events.
    Ext.on(
      (me.resizeListeners = {
        resize: me.onViewportResize,
        scope: me,
        buffer: 50
      })
    );
  },

  onDestroy: function() {
    Ext.un(this.resizeListeners);

    this.callParent();
  },

  onViewportResize: function() {
    this.syncSize();
  },

  syncSize: function() {
    var width = Ext.Element.getViewportWidth(),
      height = Ext.Element.getViewportHeight();

    // We use percentage sizes so we'll never overflow the screen (potentially
    // clipping buttons and locking the user in to the dialog).

    this.setSize(Math.floor(width * 0.9), Math.floor(height * 0.9));
    this.setXY([Math.floor(width * 0.05), Math.floor(height * 0.05)]);
  }
});
