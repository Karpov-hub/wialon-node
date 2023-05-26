Ext.define(
  "Crm.modules.requestToRegistration.model.RequestToRegistrationModel",
  {
    extend: "Crm.classes.DataModel",
    detailsInNewWindow: true,
    collection: "request_to_registration",
    idField: "id",

    fields: [
      {
        name: "id",
        type: "ObjectID",
        editable: false,
        visible: true
      },
      {
        name: "name",
        type: "string",
        filterable: true,
        editable: false,
        visible: true
      },
      {
        name: "company",
        type: "string",
        filterable: true,
        editable: false,
        visible: true
      },
      {
        name: "website",
        type: "string",
        filterable: true,
        editable: false,
        visible: true
      },
      {
        name: "is_wialon_accounts_exists",
        type: "boolean",
        filterable: true,
        editable: false,
        visible: true
      },
      {
        name: "wishes",
        type: "text",
        filterable: true,
        editable: false,
        visible: true
      },
      {
        name: "phone_number",
        type: "string",
        filterable: true,
        editable: false,
        visible: true
      },
      {
        name: "email",
        type: "string",
        filterable: true,
        editable: false,
        visible: true
      },
      {
        name: "removed",
        type: "integer",
        filterable: true,
        editable: false,
        visible: true
      },
      {
        name: "maker",
        type: "ObjectID",
        filterable: true,
        editable: false,
        visible: true
      },
      {
        name: "signobject",
        type: "JSONB",
        filterable: true,
        editable: false,
        visible: true
      },
      {
        name: "ctime",
        type: "date",
        filterable: true,
        editable: false,
        visible: true,
        sort: -1
      },
      // if status === 0 (PENDING), if status === 1 (APPROVED), if status === 2 (REJECTED)
      {
        name: "status",
        type: "integer",
        filterable: true,
        editable: false,
        visible: true
      },

      {
        name: "reject_reason",
        type: "text",
        filterable: true,
        editable: true,
        visible: true
      },
      {
        name: "realm_id",
        type: "ObjectID",
        filterable: true,
        editable: false,
        visible: true,
        bindTo: {
          collection: "realms",
          keyFieldType: "ObjectID",
          keyField: "id",
          fields: {
            name: 1,
            id: 1
          }
        }
      },
      {
        name: "lang",
        type: "string",
        filterable: true,
        editable: false,
        visible: true
      }
    ],
    /* scope:client */
    getCount(cb) {
      this.runOnServer("getCount", {}, cb);
    },

    /* scope:server */
    async $getCount(data, cb) {
      const res = await this.src.db
        .collection("request_to_registration")
        .findAll({ status: 0, removed: 0 }, {});
      cb({ count: res ? res.length : 0 });
    },

    /* scope:server */
    async onChange(params, cb) {
      this.changeModelData(
        Object.getPrototypeOf(this).$className,
        "ins",
        params
      );
      if (!!cb) cb({ success: true });
    }
  }
);
