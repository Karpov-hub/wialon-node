const Queue = require("@lib/queue");

_TABPREFIX = "";
_LAST_MESSAGE_TIME_ = new Date();
_LAST_READ_MESSAGE_TIME_ = new Date();

Ext.define("Crm.Core.ProjectServer", {
  extend: "Core.ProjectServer",
  dbConnect: function(callback) {
    var opt = Ext.clone(this.config.pgsql);

    _TABPREFIX = this.config.tablePrefix || "";

    opt.callback = conn => {
      this.connectNats(() => {
        callback();
      });
    };
    this.sources.db = Ext.create("Database.drivers.Postgresql.Database", opt);
  },

  connectNats: function(cb) {
    this.sources.queue = Ext.create("Crm.Core.Queue", this.config);

    this.sources.db
      .collection("admin_users")
      .findOne({ superuser: 1 }, {}, (e, user) => {
        Queue.subscribe("broadcast-request", data => {
          if (data.method == "call-admin") {
            Ext.create(data.data.model, {
              src: this.sources,
              config: this.config,
              user: {
                id: user._id,
                profile: user
              }
            })[data.data.method](data.data.data);
          }
        });
      });

    cb();
  }
});
