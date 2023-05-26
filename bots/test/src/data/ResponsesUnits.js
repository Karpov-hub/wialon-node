exports.core_batch_search_items = [
  {
    searchSpec: {
      itemsType: "avl_unit",
      propName: "sys_name",
      propValueMask: "*",
      sortType: "sys_name",
      propType: "",
      or_logic: "0"
    },
    dataFlags: 10493953,
    totalItemsCount: 27,
    indexFrom: 0,
    indexTo: 1,
    items: [
      {
        nm: "Citroen Jumper K630KB 799",
        cls: 2,
        id: 25821361,
        mu: 0,
        cfl: 273,
        cnm: 138777,
        cneh: 0,
        cnkb: 0,
        netconn: 0,
        cnm_km: 138777,
        pflds: {},
        pfldsmax: 0,
        uacl: -1
      },
      {
        nm: "Infinity EX25 В599МО797",
        cls: 2,
        id: 25820960,
        mu: 0,
        cfl: 801,
        cnm: 66270,
        cneh: 96.0708333333,
        cnkb: 0,
        netconn: 0,
        cnm_km: 66270,
        pflds: {
          1: {
            id: 1,
            n: "vehicle_class",
            v: "passenger_car"
          },
          2: {
            id: 2,
            n: "vin",
            v: "JN1TDNJ50U0600889"
          },
          3: {
            id: 3,
            n: "brand",
            v: "Infinity"
          },
          4: {
            id: 4,
            n: "year",
            v: "2019"
          },
          5: {
            id: 5,
            n: "model",
            v: "EX25"
          },
          6: {
            id: 6,
            n: "primary_fuel_type",
            v: "Gasoline"
          },
          7: {
            id: 7,
            n: "color",
            v: "Белый"
          }
        },
        pfldsmax: 0,
        uacl: -1
      }
    ]
  },
  {
    searchSpec: {
      itemsType: "avl_resource",
      propName: "sys_name",
      propValueMask: "*",
      sortType: "sys_name",
      propType: "",
      or_logic: "0"
    },
    dataFlags: 256,
    totalItemsCount: 9,
    indexFrom: 0,
    indexTo: 0,
    items: [
      {
        drvrs: {},
        drvrsmax: -1
      },
      {
        drvrs: {},
        drvrsmax: -1
      },
      {
        drvrs: {},
        drvrsmax: -1
      },
      {
        drvrs: {},
        drvrsmax: -1
      },
      {
        drvrs: {},
        drvrsmax: -1
      },
      {
        drvrs: {},
        drvrsmax: -1
      },
      {
        drvrs: {},
        drvrsmax: -1
      },
      {
        drvrs: {},
        drvrsmax: -1
      },
      {
        drvrs: {},
        drvrsmax: -1
      }
    ]
  }
];

exports.core_batch_search_item = [
  {
    item: {
      nm: "Citroen Jumper K630KB 799",
      cls: 2,
      id: 25821361,
      mu: 0,
      pos: {
        t: 1663999723,
        f: 7,
        lc: 0,
        y: 55.801888,
        x: 37.304363,
        c: 97,
        z: 161,
        s: 0,
        sc: 12
      },
      cfl: 273,
      cnm: 138740,
      cneh: 0,
      cnkb: 0,
      netconn: 0,
      cnm_km: 138740,
      pflds: {},
      pfldsmax: 0,
      uri: "/avl_library_image/5/0/library/unit/default.svg",
      ugi: 0,
      uacl: -1
    },
    flags: 14688273
  },
  {
    item: {
      drvrs: {},
      drvrsmax: -1
    },
    flags: 256
  }
];

exports.core_batch_get_result_rows = [
  {
    error: 5
  }
];

exports.report_update_report_create = [
  75,
  {
    id: 75,
    n: "Fuel Entry Repor",
    ct: "avl_unit",
    c: 6815
  }
];

exports.report_update_report_delete = [75, null];

exports.report_exec_ecodriving_report = {
  reportResult: {
    msgsRendered: 0,
    stats: [],
    tables: [
      {
        name: "unit_ecodriving",
        label: "Violation Rank",
        grouping: {},
        flags: 144,
        rows: 0,
        level: 1,
        columns: 1,
        header: ["Rank"],
        header_type: ["violation_rank"],
        total: ["6.0"],
        totalRaw: [
          {
            v: 6,
            vt: 111
          }
        ]
      },
      {
        name: "unit_trips",
        label: "Trips",
        grouping: {},
        flags: 144,
        rows: 1,
        level: 1,
        columns: 1,
        header: ["Beginning"],
        header_type: ["time_begin"],
        total: ["2022-09-24 07:20:51"],
        totalRaw: [
          {
            v: 1663993251,
            vt: 30
          }
        ]
      }
    ],
    attachments: []
  }
};

exports.report_exec_trips_report = {
  reportResult: {
    msgsRendered: 0,
    stats: [],
    tables: [
      {
        name: "unit_trips",
        label: "Trips",
        grouping: {},
        flags: 144,
        rows: 4,
        level: 1,
        columns: 10,
        header: [
          "Beginning",
          "Initial location",
          "End",
          "Final location",
          "Duration",
          "Mileage",
          "Avg speed",
          "Total time",
          "Off-time",
          "Following off-time"
        ],
        header_type: [
          "time_begin",
          "location_begin",
          "time_end",
          "location_end",
          "duration",
          "mileage",
          "avg_speed",
          "duration_ival",
          "duration_prev",
          "duration_next"
        ],
        total: [
          "2022-09-25 07:09:48",
          "Колхозная, Москва",
          "2022-09-25 10:28:44",
          "Житная ул., 10, Москва",
          "2:08:13",
          "113 km",
          "53 km/h",
          "3:18:56",
          "1:10:43",
          "1:10:43"
        ],
        totalRaw: [
          {
            v: 1664089788,
            vt: 30
          },
          {
            v: 0,
            vt: 1
          },
          {
            v: 1664101724,
            vt: 30
          },
          {
            v: 0,
            vt: 1
          },
          {
            v: 7693,
            vt: 40
          },
          {
            v: 113000,
            vt: 10
          },
          {
            v: 52.8792408683,
            vt: 20
          },
          {
            v: 11936,
            vt: 40
          },
          {
            v: 4243,
            vt: 40
          },
          {
            v: 4243,
            vt: 40
          }
        ]
      }
    ],
    attachments: []
  }
};
exports.token_login = {};
