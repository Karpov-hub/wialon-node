Ext.define("Crm.modules.certainPermissions.view.CertainPermissionsFormController", {
    extend: "Core.form.FormController",

    setControls: function () {
        let me = this;
        this.control({
            '[action=formclose]': { click: function (el) { this.closeView() } },
            '[action=apply]': { click: function (el) { this.savePermission(false) } },
            '[action=save]': { click: function (el) { this.savePermission(true) } },
            '[action=remove]': { click: function (el) { this.deleteRecord_do(true) } },
        });
        this.view.down('form').on({
            validitychange: function ( th , valid , eOpts ) {
                var el = me.view.down('[action=apply]');
                if(el) el.setDisabled(!valid)
                el = me.view.down('[action=save]');
                if(el) el.setDisabled(!valid)
            }
        })
    },

    setValues(data) {
        if (data && data.route_id && data.user_id) {
            data.route_id = data.route_id.id;
            data.user_id = data.user_id.id;
        }
        this.callParent(arguments);
    }

    , savePermission(closeWin) {
        const form = this.view.down('form').getValues();
        this.checkUnique(form, (res) => {
            if (res && res.success) {
                this.save(closeWin)
            } else {
                D.a("ERROR", res.message || "Something went wrong");
            }

        });
    }

    , checkUnique(data, cb) {
        this.model.checkUnique(data, (res) => {
            if (res) return cb(res)
            else return cb({ success: false })
        })
    },
});
