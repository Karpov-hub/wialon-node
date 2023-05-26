Ext.define("Core.form.TreePickerCheck", {
  extend: "Ext.form.field.Picker",
  alias: "widget.treecombocheck",
  tree: false,
  constructor: function(config) {
    this.listeners = config.listeners;
    this.callParent(arguments);
  },
  records: [],
  recursiveRecords: [],
  ids: [],
  selectChildren: true,
  canSelectFolders: true,
  multiselect: false,
  displayField: "name",
  valueField: "_id",
  treeWidth: 300,
  matchFieldWidth: false,
  treeHeight: 400,
  masN: 0,
  isReady: false,
  recursivePush: function(node, setIds) {
    var me = this;

    me.addRecRecord(node);
    if (setIds) me.addIds(node);

    node.eachChild(function(nodesingle) {
      if (nodesingle.hasChildNodes() == true) {
        me.recursivePush(nodesingle, setIds);
      } else {
        //me.addRecRecord(nodesingle);
        if (setIds) me.addIds(nodesingle);
      }
    });
  },

  recursiveUncheck: function(node) {
    node.eachChild(nodesingle => {
      if (nodesingle.hasChildNodes() == true) {
        this.recursiveUncheck(nodesingle);
      }
      nodesingle.set("checked", false);
    });
    node.set("checked", false);
  },

  recursiveUnPush: function(node) {
    var me = this;
    me.removeIds(node);

    node.eachChild(function(nodesingle) {
      if (nodesingle.hasChildNodes() == true) {
        me.recursiveUnPush(nodesingle);
      } else me.removeIds(nodesingle);
    });
  },
  addRecRecord: function(record) {
    var me = this;

    for (var i = 0, j = me.recursiveRecords.length; i < j; i++) {
      var item = me.recursiveRecords[i];
      if (item) {
        if (item.getId() == record.getId()) return;
      }
    }
    me.recursiveRecords.push(record);
  },
  afterLoadSetValue: false,
  setValue: function(valueInit) {
    if (typeof valueInit == "undefined") {
      return;
    }

    var me = this,
      tree = this.tree,
      values = !valueInit
        ? []
        : !!valueInit.split
        ? valueInit.split(",")
        : valueInit,
      valueFin = [];

    inputEl = me.inputEl;

    if (!me.isReady) {
      me.afterLoadSetValue = valueInit;
    }

    if (inputEl && me.emptyText && !Ext.isEmpty(values)) {
      inputEl.removeCls(me.emptyCls);
    }

    if (tree == false) return false;

    var node = tree.getRootNode();
    if (node == null) return false;

    me.recursiveRecords = [];
    me.recursivePush(node, false);

    me.records = [];
    Ext.each(me.recursiveRecords, function(record) {
      var id = record.get(me.valueField),
        index = !!values.indexOf ? values.indexOf("" + id) : -1;

      if (me.multiselect == true) record.set("checked", false);

      if (index != -1) {
        valueFin.push(record.get(me.displayField));
        if (me.multiselect == true) record.set("checked", true);
        me.addRecord(record);
      }
    });

    me.value = valueInit;
    me.setRawValue(valueFin.join(", "));

    me.checkChange();
    me.applyEmptyText();
    return me;
  },
  getValue: function() {
    return this.value;
  },
  getSubmitValue: function() {
    return this.value;
  },
  checkParentNodes: function(node) {
    if (node == null) return;

    var me = this,
      checkedAll = true;

    node.eachChild(function(nodesingle) {
      var id = nodesingle.getId(),
        index = me.ids.indexOf("" + id);

      if (index == -1) checkedAll = false;
    });

    if (checkedAll == true) {
      me.addIds(node);
      me.checkParentNodes(node.parentNode);
    } else {
      me.removeIds(node);
      me.checkParentNodes(node.parentNode);
    }
  },
  initComponent: function() {
    var me = this;

    if (this.dataModel) {
      this.store = this.buildStore();
      me.model = this.store.dataModel;
    }

    me.tree = Ext.create("Ext.tree.Panel", {
      alias: "widget.assetstree",
      hidden: true,
      minHeight: 300,
      rootVisible:
        typeof me.rootVisible != "undefined" ? me.rootVisible : false,
      floating: true,
      useArrows: true,
      width: me.treeWidth,
      autoScroll: true,
      height: me.treeHeight,
      store: me.store,
      displayField: me.displayField,
      listeners: {
        load: function(store, records) {
          me.isReady = true;
          if (me.afterLoadSetValue != false) {
            me.setValueImmediatly(me.afterLoadSetValue);
            me.afterLoadSetValue = false;
          }
        },
        itemclick: function(view, record, item, index, e, eOpts) {
          me.itemTreeClick(view, record, item, index, e, eOpts, me);
        }
      }
    });

    if (me.tree.getRootNode().get("checked") != null) me.multiselect = true;

    this.createPicker = function() {
      var me = this;
      return me.tree;
    };

    this.callParent(arguments);
  },

  buildStore: function() {
    return Ext.create("Core.data.StoreTree", {
      dataModel: this.dataModel,
      fieldSet: this.fieldSet || "_id,name",
      storeId: "store-" + new Date().getTime() + Math.random(),
      scope: this,
      sorters: [
        {
          property: "indx",
          direction: "ASC"
        }
      ],
      root: {
        name: "Root",
        expanded: true
      }
    });
  },

  addIds: function(record) {
    var me = this;

    if (me.ids.indexOf("" + record.getId()) == -1)
      me.ids.push("" + record.get(me.valueField));
  },
  removeIds: function(record) {
    var me = this,
      index = me.ids.indexOf("" + record.getId());

    if (index != -1) {
      me.ids.splice(index, 1);
    }
  },
  addRecord: function(record) {
    var me = this;

    for (var i = 0, j = me.records.length; i < j; i++) {
      var item = me.records[i];
      if (item) {
        if (item.getId() == record.getId()) return;
      }
    }
    me.records.push(record);
  },
  removeRecord: function(record) {
    var me = this;

    for (var i = 0, j = me.records.length; i < j; i++) {
      var item = me.records[i];
      if (item && item.getId() == record.getId()) delete me.records[i];
    }
  },
  itemTreeClick: function(view, record, item, index, e, eOpts, treeCombo) {
    var me = treeCombo,
      checked = !record.get("checked"); //it is still not checked if will be checked in this event

    if (me.multiselect == true) record.set("checked", checked); //check record

    var node = me.tree
      .getRootNode()
      .findChild(me.valueField, record.get(me.valueField), true);
    if (node == null) {
      if (me.tree.getRootNode().get(me.valueField) == record.get(me.valueField))
        node = me.tree.getRootNode();
      else return false;
    }

    if (me.multiselect == false) me.ids = [];

    //if it can't select folders and it is a folder check existing values and return false
    if (me.canSelectFolders == false && record.get("leaf") == false) {
      me.setRecordsValue(view, record, item, index, e, eOpts, treeCombo);
      return false;
    }

    //if record is leaf
    if (record.get("leaf") == true) {
      if (checked == true) {
        me.addIds(record);
      } else {
        // me.removeIds(record);
      }
    } //it's a directory
    else {
      me.recursiveRecords = [];
      if (checked == true) {
        if (me.multiselect == false) {
          if (me.canSelectFolders == true) me.addIds(record);
        } else {
          if (me.canSelectFolders == true) {
            me.recursivePush(node, true);
          }
        }
      } else {
        if (me.multiselect == false) {
          if (me.canSelectFolders == true) me.recursiveUnPush(node);
          else me.removeIds(record);
        } else me.recursiveUnPush(node);
      }
    }

    //this will check every parent node that has his all children selected
    // if(me.canSelectFolders == true && me.multiselect == true) me.checkParentNodes(node.parentNode);

    me.setRecordsValue(view, record, item, index, e, eOpts, treeCombo);
  },
  fixIds: function() {
    var me = this;

    for (var i = 0, j = me.ids.length; i < j; i++) {
      if (me.ids[i] == "NaN") me.ids.splice(i, 1);
    }
  },
  setRecordsValue: function(view, record, item, index, e, eOpts, treeCombo) {
    var me = treeCombo;

    me.fixIds();

    me.setValue(me.ids.join(","));

    me.fireEvent(
      "itemclick",
      me,
      record,
      item,
      index,
      e,
      eOpts,
      me.records,
      me.ids
    );

    if (me.multiselect == false) me.onTriggerClick();
  },

  setValueImmediatly: function(value) {
    var me = this,
      log = false;
    me.store.getRootNode().eachChild(function(item) {
      if (item.data[me.model.idField || "_id"] == value) log = true;
    });
    if (log) {
      me.setValue(value);
    } else {
      window.__TREE_STORE_OPTS__ = { url: value };

      if (me.dataModel && !me.model) me.model = Ext.create(me.dataModel);

      if (me.model) {
        var oo = {};
        oo[me.model.idField || "_id"] = value;
        me.model.runOnServer("getPids", oo, function(res) {
          if (res && res.pids) {
            me.expandBranchByPids(me.store.getRootNode(), res.pids, function() {
              //setTimeout(function() {
              me.setValue(value);
            });
          }
        });
      }
    }
  },

  expandBranchByPids: function(node, pids, cb) {
    var me = this;

    var i = pids.length - 1,
      f = function(item) {
        if (i < 0) {
          cb();
          return;
        }
        var itm = me.store.getById(pids[i]);
        i--;
        if (itm) {
          itm.expand(false, function(test) {
            setTimeout(function() {
              f(itm);
            }, 100);
          });
        } else
          setTimeout(function() {
            cb();
          }, 100);
      };

    f(node);

    //return;

    node.eachChild(function(item) {
      if (pids.indexOf(item.id) != -1) {
        item.expand(false, function() {
          pids.splice(pids.length - 1, 1);
          setTimeout(function() {
            if (pids.length) {
              me.expandBranchByPids(item, pids, cb);
            } else cb();
          }, 100);
        });
        return false;
      }
    });
  },

  setEmptyText: function(value) {
    var me = this,
      inputEl = me.inputEl,
      inputDom = inputEl && inputEl.dom,
      emptyText = value || "";

    if (value) {
      me.emptyText = emptyText;
      me.applyEmptyText();
    } else if (inputDom) {
      if (Ext.supports.Placeholder) {
        inputDom.removeAttribute("placeholder");
      } else {
        if (inputDom.value !== me.getRawValue()) {
          // only way these are !== is if emptyText is in the dom.value
          inputDom.value = "";
          inputEl.removeCls(me.emptyUICls);
        }
      }
      // value is null so it cannot be the input value:
      me.valueContainsPlaceholder = false;
    }
    // This has to be added at the end because getRawValue depends on
    // the emptyText value to return an empty string or not in legacy browsers.
    me.emptyText = emptyText;
    return me;
  }
});
