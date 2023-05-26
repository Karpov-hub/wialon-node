import Base from "@lib/base";
import Units from "./lib/Units";
import UnitDetails from "./lib/UnitDetails";
import Trip from "./lib/Trip";
import Fuel from "./lib/Fuel";
import FuelUsage from "./lib/FuelUsage";
import UtilizationCost from "./lib/UtilizationCost";
import ServiceEntries from "./lib/ServiceEntries";
import UpcomingMaintenace from "./lib/UpcomingMaintenace"
export default class Service extends Base {
  publicMethods() {
    return {
      getUpcomingMaintenance: {
        realm: true,   
        user: true,
        method: UpcomingMaintenace.getUpcomingMaintenance,
        description: "Get Upcoming Maintenance",
        schema:{
          type:"object",
          properties:{
            wialonAccountId:{type:"integer"},
            unitId:{type:"integer"},
            fromDate:{type:"string"},
            toDate:{type:"string"}
          },
          required:["wialonAccountId", "unitId","fromDate","toDate"]
      }
      },
      getServiceEntries: {
        realm: true,   
        user: true,
        method: ServiceEntries.getServiceEntries,
        description: "Get Service Entries",
        schema:{
          type:"object",
          properties:{
            wialonAccountId:{type:"integer"},
            unitId:{type:"integer"},
            fromDate:{type:"string"},
            toDate:{type:"string"}
          },
          required:["wialonAccountId", "unitId","fromDate","toDate"]
      }
      },
      getUtilizationCostDetails: {
        realm: true,   
        user: true,
        method: UtilizationCost.getUtilizationCostDetails,
        description: "Get Utilization Cost Details",
        schema:{
          type:"object",
          properties:{
            wialonAccountId:{type:"integer"},
            unitId:{type:"integer"},
            dateRangeType:{type:"integer"},
          },
          required:["wialonAccountId", "unitId","dateRangeType"]
      }
      },
      getFuelUsageDetails: {
        realm: true,   
        user: true,
        method: FuelUsage.getFuelUsageDetails,
        description: "Get Fuel Usage Details",
        schema:{
          type:"object",
          properties:{
            wialonAccountId:{type:"integer"},
            unitId:{type:"integer"},
            dateRangeType:{type:"integer"}
          },
          required:["wialonAccountId", "unitId","dateRangeType"]
      }
      },
      getFuelEntries: {     
        realm: true,   
        user: true,
        method: Fuel.getFuelEntries,
        description: "Get Fuel Entries",
        schema:{
          type:"object",
          properties:{
            wialonAccountId:{type:"integer"},
            unitId:{type:"integer"},
            dateRangeType:{type:"integer"}
          },
          required:["wialonAccountId", "unitId","dateRangeType"]
      }
      },
      getTripDetails: {     
        realm: true,   
        user: true,
        method: Trip.getTripDetails,
        description: "Get Trip Details",
        schema:{
          type:"object",
          properties:{
            wialonAccountId:{type:"integer"},
            unitId:{type:"integer"},
            dateRangeType:{type:"integer"}
          },
          required:["wialonAccountId", "unitId","dateRangeType"]
      }
      },
      getUnitResourceData: {     
        realm: true,   
        user: true,
        method: Units.getUnitResourceData,
        description: "Get Unit Resource Data",
        schema:{
            type:"object",
            properties:{
              wialonAccountId:{type:"integer"},
              startsWith:{type:"integer"},
              numOfRecords:{type:"integer"}
            },
            required:["wialonAccountId", "startsWith","numOfRecords"]
        }
      },
      getUnitDetailsData: {     
        realm: true,   
        user: true,
        method: UnitDetails.getUnitDetailsData,
        description: "Get Unit Details Data",
        schema:{
          type:"object",
          properties:{
            wialonAccountId:{type:"integer"},
            unitId:{type:"integer"}
          },
          required:["wialonAccountId", "unitId"]
      }
      }
    };
  }
}
