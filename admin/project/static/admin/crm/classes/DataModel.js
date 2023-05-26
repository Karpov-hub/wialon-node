Ext.define("Crm.classes.DataModel", {
  extend: "Core.data.DataModel",

  callApi(service, method, data, realm, user) {
    return new Promise(async (resolve, reject) => {
      if (data.files) {
        data.files = await this.filesToBase64(data.files);
      }

      this.runOnServer(
        "callApi",
        { service, method, data, realm, user },
        res => {
          console.log(res);
          resolve(res);
        }
      );
    });
  },

  async filesToBase64(files) {
    let out = [];
    for (let file of files) {
      out.push(await this.fileToBase64(file));
    }
    return out;
  },

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      if (file.data && file.name) {
        resolve({
          name: file.name,
          data: file.data
        });
      } else {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () =>
          resolve({
            name: file.name,
            data: reader.result
          });
        reader.onerror = (error) => reject(error);
      }
    });
  }
});
