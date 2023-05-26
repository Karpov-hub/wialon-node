import express from "express";
import bodyParser from "body-parser";
import ResponsesCharts from "./data/ResponsesCharts";
import ResponsesUnits from "./data/ResponsesUnits";
import ResponsesReport from "./data/ResponsesReport";
import ResponsesLogin from "./data/ResponsesLogin";
import ResponsesForFUC from "./data/ResponsesForFUC";
import ResponseRosneftTXs from "./data/ResponseRosneftTransactions";
import ResponseGetAccountData from "./data/ResponseGetAccountData";

const app = express();
app.use(bodyParser.json({ limit: "8mb" }));
app.use(
  bodyParser.urlencoded({ limit: "8mb", extended: true, parameterLimit: 8000 })
);

app.get("/fuc-aggregator/api/emv/v2/GetOperByContract", (req, res) => {
  res.send(ResponseRosneftTXs.transactions);
});

app.post("/fuc/wialon/ajax.html", (req, res) => {
  switch (req.query.svc) {
    case "report/select_result_rows":
      const paramsSRR = JSON.parse(req.query.params);
      switch (paramsSRR.tableIndex) {
        case 0:
          res.send(ResponsesForFUC.report_select_result_rows_table_index_0);
          break;
        case 1:
          res.send(ResponsesForFUC.report_select_result_rows_table_index_1);
          break;
        case 2:
          res.send(ResponsesForFUC.report_select_result_rows_table_index_2);
          break;
      }
      res.send(ResponsesForFUC.report_select_result_rows);
      break;
    case "report/exec_report":
      res.send(ResponsesForFUC.report_exect_report);
      break;
    case "report/get_report_data":
      res.send(ResponsesForFUC.report_get_report_data);
      break;
    case "report/cleanup_result":
      res.send(ResponsesForFUC.report_cleanup_result);
      break;
    case "report/update_report":
      const paramsRUP = JSON.parse(req.query.params);
      switch (paramsRUP.callMode) {
        case "create":
          res.send(ResponsesForFUC.report_update_report_create_flag);
          break;
        case "delete":
          res.send(ResponsesForFUC.report_update_report_delete_flag);
          break;
      }
      break;
    case "render/set_locale":
      res.send({});
      break;
    case "unit/registry_fuel_filling_event":
      res.send({});
      break;
    case "messages/delete_message":
      res.send({});
      break;
    case "messages/unload":
      res.send({});
      break;
    case "messages/load_interval":
      res.send(ResponsesForFUC.messages_load_interval_for_upload);
      break;
    case "token/login":
      res.send(ResponsesLogin.token_login);
      break;
    case "core/search_items":
      const paramsSearchItems = JSON.parse(req.query.params);
      switch (paramsSearchItems.flags) {
        case 9:
          res.send(ResponsesForFUC.search_items_with_flag_9);
          break;

        case 1:
          res.send(ResponsesForFUC.search_items_with_flag_1);
          break;
      }
      break;
    case "core/search_item":
      res.send(ResponsesForFUC.search_item_with_flag_9);
      break;
    case "item/update_custom_field":
      const paramsUpdateCustomField = JSON.parse(req.query.params);
      switch (paramsUpdateCustomField.callMode) {
        case "create":
          res.send(ResponsesForFUC.item_update_custom_field_add);
          break;
        case "delete":
          res.send(ResponsesForFUC.item_update_custom_field_delete);
          break;
      }
  }
});

app.post("/wialon/ajax.html", (req, res) => {
  switch (req.query.svc) {
    case "token/login":
      res.send(ResponsesLogin.token_login);
      break;
    case "core/update_data_flags":
      res.send(ResponsesCharts.core_update_data_flags_charts);
      break;
    case "core/search_items":
      res.send(ResponsesCharts.core_search_items_charts);
      break;
    case "core/duplicate":
      res.send(ResponsesCharts.core_duplicate_charts);
      break;
    case "token/update":
      let callMode = JSON.parse(req.query.params).callMode;
      if (callMode == "create") {
        res.send(ResponsesCharts.token_update_create_charts);
      } else if (callMode == "delete") {
        res.send(ResponsesCharts.token_update_delete_charts);
      }
      break;
    case "token/list":
      res.send(ResponsesCharts.token_list_charts);
      break;
    case "render/set_locale":
      res.send(ResponsesCharts.render_set_locale_charts);
      break;
    case "report/exec_report":
      res.send(ResponsesCharts.report_exec_report_charts);
      break;
    case "account/get_account_data":
      res.send(ResponseGetAccountData.response_get_account_data);
      break;
    case "core/check_items_billing":
      res.send([17940066]);
      break;
  }
});
//charts-service
app.post("/charts/wialon/ajax.html", (req, res) => {
  switch (req.query.svc) {
    case "token/login":
      res.send(ResponsesLogin.token_login);
      break;
    case "core/update_data_flags":
      res.send(ResponsesCharts.core_update_data_flags_charts);
      break;
    case "core/search_items":
      res.send(ResponsesCharts.core_search_items_charts);
      break;
    case "core/duplicate":
      res.send(ResponsesCharts.core_duplicate_charts);
      break;
    case "token/update":
      let callMode = JSON.parse(req.query.params).callMode;
      if (callMode == "create") {
        res.send(ResponsesCharts.token_update_create_charts);
      } else if (callMode == "delete") {
        res.send(ResponsesCharts.token_update_delete_charts);
      }
      break;
    case "token/list":
      res.send(ResponsesCharts.token_list_charts);
      break;
    case "render/set_locale":
      res.send(ResponsesCharts.render_set_locale_charts);
      break;
    case "report/exec_report":
      res.send(ResponsesCharts.report_exec_report_charts);
      break;
  }
});

//report-service
app.post("/report/wialon/ajax.html", (req, res) => {
  switch (req.query.svc) {
    case "token/login":
      res.send(ResponsesLogin.token_login);
      break;
    case "core/search_items":
      let avl = JSON.parse(req.body.params);

      if (avl.spec.itemsType == "avl_unit") {
        res.send(ResponsesReport.core_search_items_unit_report);
      } else if (avl.spec.itemsType == "avl_unit_group") {
        res.send(ResponsesReport.core_search_items_unit_group_report);
      }
      break;
  }
});

//units-service
let requestNumber = 0;
app.post("/units/wialon/ajax.html", (req, res) => {
  switch (req.query.svc) {
    case "token/login":
      res.send(ResponsesLogin.token_login);
      break;

    case "/core/logout":
      res.send(ResponsesLogin.logout);
      break;

    case "/core/batch":
      let svc = JSON.parse(req.body.params)[0].svc;

      if (svc == "report/get_result_rows") {
        res.send(ResponsesUnits.core_batch_get_result_rows);
      } else if (svc == "core/search_item") {
        res.send(ResponsesUnits.core_batch_search_item);
      } else if (svc == "/core/search_items") {
        res.send(ResponsesUnits.core_batch_search_items);
      }
      break;

    case "/report/update_report":
      let callMode = JSON.parse(req.body.params).callMode;

      if (callMode == "create") {
        res.send(ResponsesUnits.report_update_report_create);
      } else if (callMode == "delete") {
        res.send(ResponsesUnits.report_update_report_delete);
      }
      break;

    case "/report/exec_report":
      if (requestNumber == 7) {
        requestNumber = 0;
      }
      requestNumber++;
      if (requestNumber == 6) {
        res.send(ResponsesUnits.report_exec_trips_report);
      } else {
        res.send(ResponsesUnits.report_exec_ecodriving_report);
      }
    // case "core/search_items":
    //   let avl = JSON.parse(req.body.params);
    //   console.log();
    //   if (avl.spec.itemsType == "avl_unit") {
    //     res.send(ResponsesReport.core_search_items_unit_report);
    //   } else if (avl.spec.itemsType == "avl_unit_group") {
    //     res.send(ResponsesReport.core_search_items_unit_group_report);
    //   }
    //   break;
  }
});

//report-service
app.post("/report/wialon/ajax.html", (req, res) => {
  switch (req.query.svc) {
    case "token/login":
      res.send(ResponsesLogin.token_login);
      break;

    case "/core/logout":
      res.send(ResponsesLogin.logout);
      break;

    case "/core/batch":
      let svc = JSON.parse(req.body.params)[0].svc;

      if (svc == "report/get_result_rows") {
        res.send(ResponsesUnits.core_batch_get_result_rows);
      } else if (svc == "core/search_item") {
        res.send(ResponsesUnits.core_batch_search_item);
      } else if (svc == "/core/search_items") {
        res.send(ResponsesUnits.core_batch_search_items);
      }
      break;

    case "/report/update_report":
      let callMode = JSON.parse(req.body.params).callMode;

      if (callMode == "create") {
        res.send(ResponsesUnits.report_update_report_create);
      } else if (callMode == "delete") {
        res.send(ResponsesUnits.report_update_report_delete);
      }
      break;

    case "/report/exec_report":
      if (requestNumber == 7) {
        requestNumber = 0;
      }
      requestNumber++;
      if (requestNumber == 6) {
        res.send(ResponsesUnits.report_exec_trips_report);
      } else {
        res.send(ResponsesUnits.report_exec_ecodriving_report);
      }
      break;
    case "core/search_items":
      let avl = JSON.parse(req.body.params);

      if (avl.spec.itemsType == "avl_unit") {
        res.send(ResponsesReport.core_search_items_unit_report);
      } else if (avl.spec.itemsType == "avl_unit_group") {
        res.send(ResponsesReport.core_search_items_unit_group_report);
      }
      break;
  }
});

app.post("/tg_alarm_bot", (req, res) => {
  res.send({ ok: true });
});

const server = app.listen(8015, () => {
  console.log("Mockup is runned at localhost:", server.address().port);
});
