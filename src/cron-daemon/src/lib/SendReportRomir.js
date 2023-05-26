import Queue from "@lib/queue";

// const time = "* * * * *";
const time = "0 5 * * *";
const description = "Daily sending the Romir reports for all groups appartements for the yestrday day period(00:00:00-23:59:59)";

 async function run() {
   try {
    console.log("📊 In daily report-service mailing schedule ROMIR reports CRON job...");
    let params = {
      "method":"buildReport",
      "data":{
      "params":{
        //  FOR LOCALHOST
        // "routeId":"b135b263-72d3-4d81-8526-f4aa35e3109e", 
        // FOR PRODUCTION
        "routeId": "98d8ca74-ccdc-44c2-93d1-9a87a91ca30b",
        "group_name":null,
        "endDateMill":null,
        "startDateMill":null,
        "userTimeMill":-180,
        "userTime":new Date()
      },
      "fileType":"Xlsx",
      "report":"custom",
      "report_id":"e6a872d4-3e05-43f7-a98a-b0c9b59c2f29",
      //  FOR LOCALHOST
      // "wialonAccountId":100
      //  FOR PRODUCTION
      "wialonAccountId":110
      }
    }
    params.data.params.startDate = new Date();
    params.data.params.startDate.setDate(params.data.params.startDate.getDate() - 1);
    params.data.params.startDateMill = params.data.params.startDate.getTime();
    const { result } = await Queue.newJob("report-service", {
        method: "buildReportAwait",
        data: params.data
    });
    let arrayToSend = [];
    for (let item of result){
      if (item && item.error){
        console.error("For some reports appeared errors. Results:", item);
      } else if (item && item.code){
        //  FOR PRODUCTION
         let DOWNLOAD_DOMAIN = "https://api-dev.getgps.pro/";
        //  FOR LOCALHOST
        // let DOWNLOAD_DOMAIN = "http://localhost:8012/";
        arrayToSend.push({url: DOWNLOAD_DOMAIN + "download/" + item.code, name: item.fileName});
      }
    }
    console.log(
      `📊   Found ${result.length} reports for sending in current hour`
    );
    if (arrayToSend && arrayToSend.length > 0){
      // FOR LOCALHOST
      // let mailArray = ["id102@tadbox.com"];
      // FOR PRODUCTION
       let mailArray = ["mch@getgps.ru", "lv@getgps.ru"];
      for (let mail of mailArray){
        const resultSent = await Queue.newJob("mail-service", {
          method: "send",
          data: {
            lang: "en",
            code: "daily-report-romir",
            to: mail,
            reports: arrayToSend 
          },
          realmId: "56e4a6bb-8fde-445d-bc73-08c93f3f0e27"
        });
        if (resultSent.result.success) {
          console.log(`📊     Successfully sent to ${mail}`); 
        }
      }
    }
    console.log(`📊 Shutting down...`);
    
    return true;
   } catch(e){
     console.log(e);
   }
  }

export default {
  time,
  description,
  run
};
