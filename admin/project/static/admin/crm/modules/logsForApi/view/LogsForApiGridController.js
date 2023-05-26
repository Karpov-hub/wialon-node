Ext.define("Crm.modules.logsForApi.view.LogsForApiGridController", {
    extend: "Core.grid.GridController",

    setControls() {
        this.control({
            "[action=download-report]": {
                click: () => {
                    this.downloadReport();
                } 
            }
        });
        this.callParent(arguments);
    },

    getGridFilters() {
        let gridFilters = this.view.store.getFilters();
        let filters = {};

        for (let filter of gridFilters.items) {
            filters[filter._id] = filter._value;
        }
        return filters;
    },

    async downloadReport() {
        let filters = this.getGridFilters();

        let data = await this.model.getDataForExport(filters);

        this.download(`logs_${new Date().getTime()}.txt`,`general_count:${data.length}\n${JSON.stringify(data, null, 4)}`);
    },

    getGridFilters() {
        let gridFilters = this.view.store.getFilters();
        let filters = {};
        for(let filter of gridFilters.items) {
            filters[filter._id] = filter._value;
        }
        return filters;
    },

    download(filename, text) {
        var element = document.createElement("a");
        element.setAttribute(
          "href",
          "data:text/json;charset=utf-8," + encodeURIComponent(text)
        );
        element.setAttribute("download", filename);
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      },
});
