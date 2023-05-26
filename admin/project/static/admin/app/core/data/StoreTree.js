/**
 * @class Core.data.StoreTree
 * @extend Ext.data.TreeStore
 * @private
 * @author Max Tushev <maximtushev@gmail.ru>
 * This is a class for store for tree panel. Use Core.data.StoreTree like as {@link Core.data.Store}
 */
Ext.define("Core.data.StoreTree", {
  extend: "Ext.data.TreeStore",
  autoLoad: false,
  constructor: function(options) {
    this.wsModel = model = Ext.create("Ext.data.TreeModel", {
      fields: this.initModel({
        dataModel: options.dataModel || this.dataModel,
        fieldSet: options.fieldSet || this.fieldSet
      })
    });

    options.autoLoad = false;

    this.remoteSort = true;
    this.remoteGroup = true;
    this.remoteFilter = true;
    this.rootOpt = options.root;

    this.wsProxy = this.createProxy({
      dataModel: options.dataModel || this.dataModel,
      fieldSet: options.fieldSet || this.fieldSet
    });

    this.initDataGetter(options);

    this.callParent(options);
  },

  initDataGetter: function() {
    var me = this;

    setTimeout(function() {
      me.setModel(me.wsModel);
      me.setProxy(me.wsProxy);
      me.createReader();

      var root = me.setRoot(me.rootOpt);

      me.dataActionsSubscribe();
      //root.load();
      //if(me.autoLoad) {
      //me.load();
      //}
    }, 100);
  },

  createReader: function() {
    var p = this.getProxy();
    p.setReader(
      Ext.create("Ext.data.reader.Json", {
        rootProperty: "list",
        totalProperty: "total",
        successProperty: "success"
      })
    );
  },

  initModel: function(options) {
    var me = this,
      modelPath,
      fields = [];

    me.id = "store-" + new Date().getTime() + Math.random();

    if (options.dataModel) {
      if (Ext.isString(options.dataModel)) {
        me.dataModel = Ext.create(options.dataModel);
        me.modelPath = options.dataModel;
      } else {
        me.dataModel = options.dataModel;
        me.modelPath = Object.getPrototypeOf(options.dataModel).$className;
      }
    }

    if (options.fieldSet) {
      if (Ext.isString(options.fieldSet))
        options.fieldSet = options.fieldSet.split(",");
      fields = [{ name: this.dataModel.idField }];

      for (var i = 0; i < options.fieldSet.length; i++)
        fields.push({ name: options.fieldSet[i] });
    } else {
      fields = me.dataModel.fields.items;
    }
    return fields;
  },

  createProxy: function(options) {
    var me = this;

    return Ext.create("Ext.ux.data.proxy.WebSocket", {
      storeId: me.id,
      websocket: Glob.ws,
      params: {
        model: me.modelPath,
        scope: me.id,
        fieldSet: options.fieldSet
      },
      reader: {
        type: "json",
        rootProperty: "list",
        totalProperty: "total",
        successProperty: "success"
      },
      simpleSortMode: true,
      filterParam: "query",
      remoteFilter: true
    });
  },

  /**
   * @method
   * Subscribing this store to the server model events
   */
  dataActionsSubscribe: function() {
    var me = this,
      wid = me.scope ? me.scope.id : me.modelPath;
    if (me.scope) {
      // remove subscription when window is closed
      me.scope.on("destroy", function() {
        Glob.ws.unsubscribe(wid);
      });
    }
    Glob.ws.subscribe(wid, me.modelPath, function(action, data) {
      me.onDataChange(action, data);
    });
  },

  /**
   * @method
   * This method fires when the model data has been changed on the server
   * @param {String} action one of ins, upd or remove
   * @param {Object} data
   */
  onDataChange: function(action, data) {
    var me = this;
    if (!Ext.isArray(data)) data = [data];
    switch (action) {
      case "ins":
        me.insertData(data);
        break;
      case "upd":
        me.updateData(data);
        break;
      case "remove":
        me.removeData(data);
        break;
    }
  },

  /**
   * @method
   * The action for inserting
   * @paramn {Object} data
   */
  insertData: function(data) {
    this.reload();
    /*
        return;
        
        var me = this       
        var func = function(nodes) {
            for(var i=0;i<nodes.length;i++) {
                if(nodes[i].childNodes && nodes[i].childNodes.length)  func(nodes[i].childNodes)
                for(var j=0;j<data.length;j++) {
                    if(data[j].pid == nodes[i].data[me.dataModel.idField]) {
                        //Ext.apply(nodes[i].data, data[j])
                        nodes[i].appendChild(data);
                        break;
                    }
                }
            }
        }
        if(data.length)
            func(me.getRootNode().childNodes)
        */
  },

  /**
   * @method
   * The action for updating
   * @paramn {Object} data
   */
  updateData: function(data) {
    var me = this;
    var func = function(nodes) {
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].childNodes && nodes[i].childNodes.length)
          func(nodes[i].childNodes);
        for (var j = 0; j < data.length; j++) {
          if (
            data[j][me.dataModel.idField] == nodes[i].data[me.dataModel.idField]
          ) {
            Ext.apply(nodes[i].data, data[j]);
            nodes[i].commit();
            break;
          }
        }
      }
    };
    if (data.length) func(me.getRootNode().childNodes);
  },

  /**
   * @method
   * The action for removing
   * @paramn {Object} data
   */
  removeData: function(data) {
    // action to removing data
  },

  load: function(options) {
    options = options || {};
    options.params = options.params || {};

    var me = this,
      node = options.node || me.getRoot(),
      callback = options.callback,
      scope = options.scope,
      clearOnLoad = me.getClearOnLoad(),
      // If we are loading the root, and clearing on load, then it is a whole
      // store reload.
      // This is handled efficiently in onProxyLoad by firing the refresh event
      // which will completely refresh any dependent views as would be expected
      // from a reload() call.
      isReload = node && node.isRoot() && node.isLoaded() && clearOnLoad,
      operation,
      doClear;

    // If there is not a node it means the user hasn't defined a root node yet. In this case let's just
    // create one for them. The expanded: true will cause a load operation, so return.
    if (!node) {
      me.setRoot({
        expanded: true
      });
      return;
    }

    // If this is not a root reload.
    // If the node we are loading was expanded, we have to expand it after the load
    if (node.data.expanded && !isReload) {
      node.data.loaded = false;

      // Must set expanded to false otherwise the onProxyLoad->fillNode->appendChild calls will update the view.
      // We ned to update the view in the callback below.
      if (clearOnLoad) {
        node.data.expanded = false;
      }
      options.callback = function(loadedNodes, operation, success) {
        // If newly loaded nodes are to be added to the existing child node set, then we have to collapse
        // first so that they get removed from the NodeStore, and the subsequent expand will reveal the
        // newly augmented child node set.
        if (!clearOnLoad) {
          node.collapse();
        }
        node.expand();

        // Call the original callback (if any)
        Ext.callback(callback, scope, [loadedNodes, operation, success]);
      };
    }

    // Assign the ID of the Operation so that a ServerProxy can set its idParam parameter,
    // or a REST proxy can create the correct URL
    options.id = node.getId();

    options = Ext.apply(
      {
        filters: options.filters || me.getFilters().items,
        sorters: me.getSorters().items,
        node: options.node || node,
        internalScope: me,
        internalCallback: me.onProxyLoad,
        url: options.url || ""
      },
      options
    );

    if (window.__TREE_STORE_OPTS__) {
      Ext.apply(options, window.__TREE_STORE_OPTS__);
      delete window.__TREE_STORE_OPTS__;
    }

    me.lastOptions = Ext.apply({}, options);

    // Must not be copied into lastOptions, otherwise it overrides next call.
    options.isReload = isReload;

    operation = me.createOperation("read", options);

    if (me.fireEvent("beforeload", me, operation) !== false) {
      // Set the loading flag early
      // Used by onNodeRemove to NOT add the removed nodes to the removed collection
      me.loading = true;
      me.clearLoadTask();

      // If this is a full root reload, clear the root node and the flat data.
      if (isReload) {
        if (me.getClearRemovedOnLoad()) {
          me.removedNodes.length = 0;
        }
        me.unregisterNode(node, true);
        node.childNodes.length = 0;
        doClear = true;
      }
      // If clear node on load, remove its children
      else if (clearOnLoad) {
        if (me.getTrackRemoved() && me.getClearRemovedOnLoad()) {
          // clear from the removed array any nodes that were descendants of the node being reloaded so that they do not get saved on next sync.
          me.clearRemoved(node);
        }
        node.removeAll(false);
      }

      if (me.loading && node) {
        node.set("loading", true);
      }

      if (doClear) {
        me.clearData(true);
        // Readd the root we just cleared, since we're reloading it
        if (me.getRootVisible()) {
          me.suspendEvents();
          me.add(node);
          me.resumeEvents();
        }
      }

      operation.execute();
    }

    return me;
  }
});
