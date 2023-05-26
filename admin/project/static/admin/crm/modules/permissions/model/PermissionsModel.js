Ext.define("Crm.modules.permissions.model.PermissionsModel", {
  extend: "Core.data.DataModel",

  collection: "routes",
  idField: "id",
  removeAction: "remove",

  fields: [],

  /* scope:server */
  beforeSave: function(data, cb) {
    cb({});
  },

  usedRoles: ["admin", "user"],

  /* scope:client */
  savePermissions(data) {
    return new Promise((resolve) => {
      this.runOnServer("savePermissions", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  $savePermissions: function(data, cb) {
    // cb({});
    var me = this;
    var rolesIds = {},
      role_id = null,
      lastMaxId = null;
    var Util = Ext.create("Crm.Utils.Util", { scope: me });
    var PermissionsWriteModel = Ext.create(
      "Crm.modules.permissions.model.PermissionsWriteModel",
      { scope: me }
    );
    var usedRoles = me.usedRoles,
      organization_id = null;
    var sql = "",
      sqlPlaceHolders = [];
    if (data && data.routes) {
      data = data.routes;
    }
    [
      function(roleOperation) {
        //Getting rolesIds.
        usedRoles.prepEach(
          function(role, roleNext) {
            me.getRoleInfoByName({ role: role }, function(res) {
              if (res && res.error) {
                console.log("BeforeSave: Error: " + JSON.stringify(res));
                return cb({
                  success: false,
                  error: { message: "Database Failure." }
                });
              } else {
                rolesIds[role] = res.id;
                roleNext(role);
              }
            });
          },
          function() {
            roleOperation();
          }
        );
      },
      function(next) {
        let sql = 'select max(id) as max from "Permissions";';
        me.src.db.query(sql, [], function(err, maxId) {
          if (err) {
            console.log(
              "Error while writing permissions. Error: " + JSON.stringify(err)
            );
            return;
          } else {
            lastMaxId = maxId[0].max;
            return next();
          }
        });
      },
      function(roleOperation) {
        //Getting organization Id,role Id for adding permissions.
        var existRoles = [],
          roleSql = "";
        var failureRoutes = [];
        if (data && data.length) {
          data.prepEach(
            function(route, nextRoute) {
              organization_id = null;
              existRoles = [];
              if (route.organization_id && route.organization_id != "") {
                organization_id = route.organization_id;
              }
              [
                function(next) {
                  sqlPlaceHolders = [];
                  sqlPlaceHolders.push(route.id);
                  sql = 'select id from "Permissions" where route_id=$1';
                  if (!organization_id) {
                    sql +=
                      " AND (organization_id is NULL OR organization_id::text='')";
                  } else {
                    sqlPlaceHolders.push(organization_id);
                    sql += " AND organization_id=$" + sqlPlaceHolders.length;
                  }
                  usedRoles.forEach((role) => {
                    if (route[role] != undefined) {
                      existRoles.push({ [role]: rolesIds[role] });
                    }
                  });
                  if (existRoles && existRoles.length) {
                    next();
                  } else {
                    console.log(
                      "Valid roles not found for route: " +
                        JSON.stringify(route)
                    );
                    failureRoutes.push({
                      id: route.id,
                      method: route.method,
                      reason: "Valid roles not found."
                    });
                    nextRoute(route);
                  }
                },
                function(next) {
                  roleSql = "";
                  var pemissionId = null;
                  usedRoles.prepEach(
                    function(role, nextRoleProcess) {
                      var roleExist = existRoles.filter(function(r) {
                        return r && r[role] != undefined ? true : false;
                      });
                      pemissionId = null;
                      if (roleExist && roleExist.length) {
                        roleSql =
                          sql + " AND role_id='" + roleExist[0][role] + "'";
                        me.src.db.query(roleSql, sqlPlaceHolders, function(
                          err,
                          res
                        ) {
                          var writeData = {
                            organization_id: organization_id,
                            route_id: route.id,
                            role_id: roleExist[0][role],
                            is_permissible: route[role] ? true : false,
                            mtime: new Date()
                          };
                          if (err) {
                            console.log(
                              "Error while fetching role:" + JSON.stringify(err)
                            );
                            return nextRoleProcess(role);
                          } else {
                            if (res && res.length) {
                              pemissionId = res[0].id;
                              writeData.id = pemissionId;
                            } else {
                              if (route[role]) {
                                pemissionId = null;
                                writeData.ctime = new Date();
                                // writeData.createdat=new Date();
                              } else {
                                return nextRoleProcess(role);
                              }
                            }
                            // writeData.updatedat=new Date();
                            writeData.mtime = new Date();
                            if (!writeData.id) {
                              writeData.id = lastMaxId + 1;
                              lastMaxId++;
                            }
                            if (res && res.length) {
                              var updatesql =
                                'update "Permissions" set is_permissible=' +
                                writeData.is_permissible +
                                " where id=" +
                                writeData.id +
                                ";";
                              me.src.db.query(updatesql, [], function(
                                err,
                                res
                              ) {
                                if (err) {
                                  console.log(
                                    "Error while writing permissions. Error: " +
                                      JSON.stringify(err)
                                  );
                                  failureRoutes.push({
                                    id: route.id,
                                    method: route.method,
                                    reason: "Database Failure."
                                  });
                                }
                                return nextRoleProcess(role);
                              });
                            } else {
                              PermissionsWriteModel.write(
                                writeData,
                                function(res) {
                                  if (!res.success) {
                                    console.log(
                                      "Error while writing permissions. Error: " +
                                        res.error +
                                        " route:" +
                                        JSON.stringify(route)
                                    );
                                    failureRoutes.push({
                                      id: route.id,
                                      method: route.method,
                                      reason: "Database Failure."
                                    });
                                  }
                                  return nextRoleProcess(role);
                                },
                                { add: 1 }
                              );
                            }
                          }
                        });
                      } else {
                        return nextRoleProcess(role);
                      }
                    },
                    function() {
                      nextRoute(route);
                    }
                  );
                }
              ].runEach();
            },
            function() {
              return cb({ success: true, failureRoutes: failureRoutes });
            }
          );
        } else {
          //Routes not found.
          return cb({
            success: false,
            error: { message: "Routes not found." }
          });
        }
      }
    ].runEach();
  },

  /* scope:server */
  getRoleInfoByName: function(data, cb) {
    var me = this;
    var sql = `select role,id from roles where role ilike $1`;
    me.src.db.query(sql, [data.role], function(err, res) {
      if (err) {
        console.log("Fn:getRoutes Error: " + JSON.stringify(err));
        cb({ error: { message: "Database failure,Please try again." } });
      } else {
        cb(res[0]);
      }
    });
  },

  /* scope:server */
  isEmpty: function(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
  },

  /* scope:client */
  addNewRoute(data) {
    return new Promise((resolve) => {
      this.runOnServer("addNewRoute", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  $addNewRoute: function(reqData, cb) {
    var me = this;
    var routeWriteData = {};
    var customReportsWriteData = {};
    var permissionsWriteDataList = [];
    var usedRoles = me.usedRoles,
      rolesIds = {};
    var PermissionsWriteModel = Ext.create(
      "Crm.modules.permissions.model.PermissionsWriteModel",
      { scope: me }
    );
    var CustomReportsModel = Ext.create(
      "Crm.modules.customreports.model.ReportsModel",
      { scope: me }
    );
    var routesModel = Ext.create("Crm.modules.routes.model.RoutesModel", {
      scope: me
    });
    [
      function(next) {
        //Validations
        var errors = me.validateAddEditRouteRequest(reqData);
        if (errors && errors.length) {
          cb({ validationErrors: errors });
        } else {
          next();
        }
      },
      function(next) {
        //Getting rolesIds.
        usedRoles.prepEach(
          function(role, roleNext) {
            me.getRoleInfoByName({ role: role }, function(res) {
              if (res && res.error) {
                console.log(
                  "$addNewRoute Database Failure: " + JSON.stringify(res)
                );
                cb({ error: { message: "Database failure." } });
              } else {
                rolesIds[role] = res.id;
                roleNext(role);
              }
            });
          },
          function() {
            if (me.isEmpty(rolesIds)) {
              cb({ error: { message: "Roles not found." } });
            } else {
              next();
            }
          }
        );
      },
      function(next) {
        //Saving route.
        routeWriteData = {
          report_name: reqData.report_name,
          method: reqData.method,
          description: reqData.description,
          requirements: reqData.requirements,
          service: reqData.service,
          type: reqData.type,
          report_id: reqData.report_id ? reqData.report_id : null,
          jasper_report_code: reqData.jasper_report_code,
          formats: reqData.formats
        };
        if (reqData.type == 0 || reqData.type == 1) {
          routeWriteData.organization_id = null;
        } else {
          routeWriteData.organization_id = reqData.organization_id;
        }
        routesModel.write(
          routeWriteData,
          function(res) {
            if (res.success) {
              next(res.record);
            } else {
              console.log(
                "$addNewRoute Error while writing routes. Error: " +
                  res.error +
                  " route:" +
                  JSON.stringify(routeWriteData)
              );
              cb({ error: { message: "Database failure." } });
            }
          },
          { add: 1 }
        );
      },
      function(routeRecord, next) {
        if (reqData.report_id != null) {
          var sql = "SELECT id FROM customreports WHERE id = $1";
          var sqlPlaceHolders = [reqData.report_id];
          me.src.db.query(sql, sqlPlaceHolders, function(err, res) {
            if (err) {
              console.log(
                "$addNewRoute Database Failure:" + JSON.stringify(err)
              );
              return cb({ error: { message: "Database failure." } });
            } else if (res && res.length == 0) {
              customReportsWriteData = {
                id: reqData.report_id,
                name: reqData.report_name,
                description: reqData.description
              };
              CustomReportsModel.write(
                customReportsWriteData,
                function(res) {
                  if (res.success) {
                    return next(routeRecord);
                  } else {
                    console.log(
                      "$addNewRoute Error while writing customreports. Error: " +
                        res.error +
                        " route:" +
                        JSON.stringify(customReportsWriteData)
                    );
                    return cb({ error: { message: "Database failure." } });
                  }
                },
                { add: 1 }
              );
            } else {
              return next(routeRecord);
            }
          });
        } else {
          return next(routeRecord);
        }
      },
      function(routeRecord, next) {
        //Arranging permissions based on type of route.
        if (reqData.type == 0 || reqData.type == 1) {
          routeWriteData.organization_id = null;
          var sql = "select id from organizations where removed!=1";
          me.src.db.query(sql, [], function(err, res) {
            if (err) {
              console.log(
                "$addNewRoute Database Failure:" + JSON.stringify(err)
              );
              cb({ error: { message: "Database failure." } });
            } else if (res && res.length) {
              res.forEach((orgRec) => {
                usedRoles.forEach((role) => {
                  permissionsWriteDataList.push({
                    route_id: routeRecord.id,
                    role_id: rolesIds[role],
                    organization_id: orgRec.id,
                    is_permissible: false,
                    updatedat: new Date(),
                    createdat: new Date()
                  });
                });
              });
              next();
            } else {
              cb({ error: { message: "Organizations not found." } });
            }
          });
        } else {
          routeWriteData.organization_id = reqData.organization_id;
          usedRoles.forEach((role) => {
            permissionsWriteDataList.push({
              route_id: routeRecord.id,
              role_id: rolesIds[role],
              organization_id: reqData.organization_id,
              is_permissible: false,
              updatedat: new Date(),
              createdat: new Date()
            });
          });
          next();
        }
      },
      function(next) {
        //Saving permissions.
        permissionsWriteDataList.prepEach(
          function(writeData, writeNext) {
            PermissionsWriteModel.write(
              writeData,
              function(res) {
                if (!res.success) {
                  console.log(
                    "Error while writing permissions. Error: " +
                      res.error +
                      " Permissions:" +
                      JSON.stringify(writeData)
                  );
                }
                return writeNext(writeData);
              },
              { add: 1 }
            );
          },
          function() {
            cb({ success: true });
          }
        );
      }
    ].runEach();
  },

  /* scope:server */
  validateAddEditRouteRequest: function(reqData) {
    var errors = [],
      requiredFields = {
        method: "Route",
        service: "Service",
        report_name: "Report Name"
      };
    if (!reqData || !reqData.updateFlag) {
      requiredFields["organization_id"] = "Organization";
      requiredFields["type"] = "Type";
    }
    for (var key in requiredFields) {
      if (
        !reqData ||
        (reqData &&
          (reqData[key] == undefined ||
            (reqData[key] && reqData[key].toString().trim() == "")))
      ) {
        errors.push({
          field: key,
          message: requiredFields[key] + " field is required."
        });
      } else {
        if (
          key == "type" &&
          parseInt(reqData[key]) != 1 &&
          parseInt(reqData[key]) != 2
        ) {
          errors.push({
            field: key,
            message: requiredFields[key] + " field is invalid."
          });
        } else if (key == "method") {
          if (
            reqData[key]
              .toString()
              .trim()
              .split(" ").length >= 2
          ) {
            errors.push({
              field: key,
              message:
                requiredFields[key] + " field is invalid(space not allowed)."
            });
          }
        }
      }
    }
    if (reqData && reqData.updateFlag && !reqData.id) {
      errors.push({
        field: "id",
        message: " Route field is is required."
      });
    }
    this.trimData(reqData);
    return errors;
  },

  /* scope:server */
  trimData(reqData) {
    for (var key in reqData) {
      if (key && reqData[key] && typeof reqData[key] == "string") {
        reqData[key] = reqData[key].toString().trim();
      }
    }
  },

  /* scope:client */
  editRoute(data) {
    return new Promise((resolve) => {
      this.runOnServer("editRoute", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  $editRoute: function(reqData, cb) {
    var me = this;
    var customReportsWriteData = {};
    var CustomReportsModel = Ext.create(
      "Crm.modules.customreports.model.ReportsModel",
      { scope: me }
    );
    var routesModel = Ext.create("Crm.modules.routes.model.RoutesModel", {
      scope: me
    });
    [
      function(next) {
        //Validations
        reqData.updateFlag = true;
        var errors = me.validateAddEditRouteRequest(reqData);
        if (errors && errors.length) {
          cb({ validationErrors: errors });
        } else {
          next();
        }
      },
      function(next) {
        //Update route
        var routeWriteData = {
          id: reqData.id,
          report_name: reqData.report_name,
          method: reqData.method,
          description: reqData.description,
          requirements: reqData.requirements,
          service: reqData.service,
          report_id: reqData.report_id ? reqData.report_id : null,
          jasper_report_code: reqData.jasper_report_code,
          formats: reqData.formats ? reqData.formats : null
        };

        routesModel.write(
          routeWriteData,
          function(res) {
            if (res.success) {
              next();
            } else {
              console.log(
                "$editRoute Error while updating routes. Error: " +
                  res.error +
                  " route:" +
                  JSON.stringify(routeWriteData)
              );
              cb({ error: { message: "Database failure." } });
            }
          },
          { modify: 1 }
        );
      },
      function(routeRecord, next) {
        if (reqData.report_id != null) {
          var sql = "SELECT id FROM customreports WHERE id = $1";
          var sqlPlaceHolders = [reqData.report_id];
          me.src.db.query(sql, sqlPlaceHolders, function(err, res) {
            if (err) {
              console.log(
                "$addNewRoute Database Failure:" + JSON.stringify(err)
              );
              return cb({ error: { message: "Database failure." } });
            } else if (res && res.length == 0) {
              customReportsWriteData = {
                id: reqData.report_id,
                name: reqData.report_name,
                description: reqData.description
              };
              CustomReportsModel.write(
                customReportsWriteData,
                function(res) {
                  if (res.success) {
                    return cb({ success: true });
                  } else {
                    console.log(
                      "$addNewRoute Error while writing customreports. Error: " +
                        res.error +
                        " route:" +
                        JSON.stringify(customReportsWriteData)
                    );
                    return cb({ error: { message: "Database failure." } });
                  }
                },
                { add: 1 }
              );
            } else {
              return cb({ success: true });
            }
          });
        } else {
          return cb({ success: true });
        }
      }
    ].runEach();
  },

  /* scope:client */
  getRouteswithPermissionsList(data) {
    return new Promise((resolve) => {
      this.runOnServer("getRouteswithPermissionsList", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  $getRouteswithPermissionsList: function(data, cb) {
    var me = this;
    [
      function(next) {
        //Getting all types of routes.
        me.getRoutes(
          {
            organization_id: data.organization_id ? data.organization_id : null
          },
          function(res) {
            if (res.error) {
              cb(res);
            } else if (res && res.length) {
              next(res);
            } else {
              cb({ error: { message: "Routes not found." } });
            }
          }
        );
      },
      function(routeData, next) {
        //Getting permissions.
        var sql = "",
          usedRoles = me.usedRoles,
          sqlPlaceHolders = [];
        routeData.prepEach(
          function(route, nextRoute) {
            if (
              route &&
              (!route.organization_id || route.organization_id == "") &&
              (data.organization_id || data.organization_id != "")
            ) {
              route.organization_id = data.organization_id;
            }
            sqlPlaceHolders = [];
            sql = ` SELECT LOWER(role) as role,is_permissible FROM "Permissions" p
                INNER JOIN roles r ON (p.role_id=r.id
              `;
            sqlPlaceHolders.push(route.id);
            sql += ` AND p.route_id=$` + sqlPlaceHolders.length;

            if (route.organization_id && route.organization_id != "") {
              sqlPlaceHolders.push(route.organization_id);
              sql += ` AND organization_id=$` + sqlPlaceHolders.length;
            } else {
              sql += ` AND (organization_id::text='' OR organization_id is NULL)`;
            }
            sql += `)`;
            me.src.db.query(sql, sqlPlaceHolders, function(err, res) {
              if (err) {
                console.log(
                  "Fn:$getRouteswithPermissionsList Error: " +
                    JSON.stringify(err)
                );
                cb({
                  error: { message: "Database failure,Please try again." }
                });
              } else if (res && res.length) {
                usedRoles.forEach((role) => {
                  var result = res.filter(function(r) {
                    return r && r.role.indexOf(role) != -1 ? true : false;
                  });
                  route[role] =
                    result && result.length && result[0].is_permissible ? 1 : 0;
                });
                nextRoute(route);
              } else {
                usedRoles.forEach((role) => {
                  route[role] = 0;
                });
                nextRoute(route);
              }
            });
          },
          function() {
            next(routeData);
          }
        );
      },
      function(routeData) {
        //Formatting routes based on type
        cb({
          //basic_routes:routeData.filter(function(r){return (r && r.type==0)?true:false;}),
          generic_routes: routeData.filter(function(r) {
            return r && r.type == 1 ? true : false;
          }),
          customized_routes: routeData.filter(function(r) {
            return r && r.type == 2 ? true : false;
          })
        });
      }
    ].runEach();
  },

  /* scope:client */
  deleteRoute(data) {
    return new Promise((resolve) => {
      this.runOnServer("deleteRoute", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  $deleteRoute: function(data, cb) {
    var me = this,
      sql = "",
      sqlPlaceHolders;
    if (data && data.id && data.id.toString().trim() != "") {
      [
        function(next) {
          //Delete route
          sql = "delete from routes where id=$1";
          me.src.db.query(sql, [data.id], function(err, res) {
            if (err) {
              console.log("Fn:$deleteRoute Error: " + JSON.stringify(err));
              cb({ error: { message: "Database failure,Please try again." } });
            } else {
              next();
            }
          });
        },
        function(next) {
          sql = "SELECT id FROM routes WHERE report_id = $1";
          sqlPlaceHolders = [data.report_id];
          me.src.db.query(sql, sqlPlaceHolders, function(err, res) {
            if (err) {
              console.log("Fn:$deleteRoute Error: " + JSON.stringify(err));
              return cb({
                error: { message: "Database failure,Please try again." }
              });
            } else {
              if (res && res.length == 0) {
                sql = "DELETE FROM customreports WHERE id = $1";
                me.src.db.query(sql, sqlPlaceHolders, function(err, res) {
                  if (err) {
                    console.log(
                      "Fn:$deleteRoute Error: " + JSON.stringify(err)
                    );
                    return cb({
                      error: { message: "Database failure,Please try again." }
                    });
                  } else {
                    return next();
                  }
                });
              } else if (res && res.length > 0) {
                return next();
              }
            }
          });
        },
        function(next) {
          //Delete all permissions related to route
          sql = 'delete from "Permissions" where route_id=$1';
          me.src.db.query(sql, [data.id], function(err, res) {
            if (err) {
              console.log("Fn:$deleteRoute Error: " + JSON.stringify(err));
              cb({ error: { message: "Database failure,Please try again." } });
            } else {
              cb({ success: true });
            }
          });
        }
      ].runEach();
    } else {
      cb({ error: { message: "Please provide valid route Id." } });
    }
  },

  /* scope:server */
  getRoutesBasedOnObject: function(reqData, cb) {
    var me = this,
      sqlPlaceHolders = [];
    var sql = `SELECT id,ctime,method,description,organization_id FROM routes
            WHERE type=0 and (organization_id is NULL
            OR organization_id::text=''`;
    if (reqData && reqData.organization_id) {
      if (reqData.organization_id && reqData.organization_id.length < 36) {
        return cb({ error: { message: "Organization is not valid." } });
      }
      sqlPlaceHolders.push(reqData.organization_id);
      sql += ` OR organization_id=$` + sqlPlaceHolders.length;
    }
    sql += `)`;
    var mainSql = `SELECT
    (
      SELECT
      (
        SELECT Json_agg(item)
        FROM  ( ${sql} ) item ) AS basic_routes),
    (
      SELECT
      (
        SELECT json_agg(item)
        FROM  ( ${sql.replace("type=0", "type=1")} ) item ) AS generic_routes),
    (
      SELECT
      (
        SELECT json_agg(item)
        FROM  ( ${sql.replace(
          "type=0",
          "type=2"
        )} ) item ) AS customized_routes) ;
    `;
    me.src.db.query(mainSql, sqlPlaceHolders, function(err, res) {
      if (err) {
        console.log("Fn:getRoutes Error: " + JSON.stringify(err));
        cb({ error: { message: "Database failure,Please try again." } });
      } else {
        cb(res);
      }
    });
  },

  /* scope:server */
  getRoutes: function(reqData, cb) {
    var me = this,
      sqlPlaceHolders = [];
    var sql = `SELECT id, ctime, report_name,method,description,organization_id,type,requirements,service,report_id,jasper_report_code,formats FROM routes
            WHERE (organization_id is NULL
            OR organization_id::text=''`;
    if (reqData && reqData.organization_id) {
      if (reqData.organization_id && reqData.organization_id.length < 36) {
        return cb({ error: { message: "Organization is not valid." } });
      }
      sqlPlaceHolders.push(reqData.organization_id);
      sql += ` OR organization_id=$` + sqlPlaceHolders.length;
    }
    sql += `)`;
    if (reqData && reqData.type) {
      sqlPlaceHolders.push(reqData.type);
      sql += ` AND type=$` + sqlPlaceHolders.length;
    } else {
      sql += ` AND type in(0,1,2)`;
    }
    sql += ` ORDER BY ctime DESC`;
    me.src.db.query(sql, sqlPlaceHolders, function(err, res) {
      if (err) {
        console.log("Fn:getRoutes Error: " + JSON.stringify(err));
        cb({ error: { message: "Database failure,Please try again." } });
      } else {
        cb(res);
      }
    });
  }
});
