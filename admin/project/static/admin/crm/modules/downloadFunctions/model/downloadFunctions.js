Ext.define("Crm.modules.downloadFunctions.model.downloadFunctions", {
  extends: "Crm.classes.DataModel",

    /* scope:client */
    async getSecretKey(params, cb) {
      return new Promise((resolve, reject) => {
        this.runOnServer("getSecretKey", params, resolve);
      });
    },
  
    /* scope:server */
    async $getSecretKey(params, cb) {
      const hash = await this.createHash(process.env.SECRET_KEY+params.uid);
      return cb(hash);
    },
    /* scope:server */
    async createHash (stringData) {
      const crypto = require("crypto");
      let hash = crypto.createHash('sha1');
      let data = hash.update(stringData, 'utf8');
      let gen_hash = data.digest('hex');
      return gen_hash;
    },
});
