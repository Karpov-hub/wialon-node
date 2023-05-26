import commonMethods from "./common-methods";

async function getFileName(params){
    switch(params.report_id){
        case '9c317886-0532-4aa8-b71a-6cbc4a92657c': {
            let allGroups = await commonMethods.getAllGroups(params);
            let filteredArray = allGroups.filter(item => item.id == params.params.group_name);  
            if (filteredArray.length > 0){
                return filteredArray[0].name + "_" +await getDateString(params.params.startDateMill);
            } else {
                return Date.now();
            }
        }
        default: {
            return Date.now();
        }
    }
}

async function getDateString(timespan) {
    return (new Date(timespan * 1000).getDate() > 9 ? new Date(timespan * 1000).getDate() : "0" + new Date(timespan * 1000).getDate().toString())  
    + "." + (new Date(timespan * 1000).getMonth() > 8 ? new Date(timespan * 1000).getMonth() + 1 : "0" + (new Date(timespan * 1000).getMonth() + 1).toString())
    + "." + new Date(timespan * 1000).getFullYear();
  }
async function getTimeString(timespan) {
    return (new Date(timespan * 1000).getHours() > 9 ? new Date(timespan * 1000).getHours()  : "0" + new Date(timespan * 1000).getHours().toString()) + ":"  
    + (new Date(timespan * 1000).getMinutes() > 9 ? new Date(timespan * 1000).getMinutes()  : "0" + new Date(timespan * 1000).getMinutes().toString()) + ":" 
    + (new Date(timespan * 1000).getSeconds() > 9 ? new Date(timespan * 1000).getSeconds()  : "0" + new Date(timespan * 1000).getSeconds().toString()) ;
  }

export default {
    getFileName
};