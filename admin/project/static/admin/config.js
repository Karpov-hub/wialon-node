__CONFIG__ = {
  FirstRedirect: "Crm.modules.realm.view.RealmGrid",
  // downloadFileLink: "https://getgps.pro/download/",
  LoginUrl: "/Crm.Admin.login/",
  downloadFileLink:
    location.protocol == "http:"
      ? location.protocol + "//" + location.hostname + ":8012/download"
      : "https://api-dev.getgps.pro/download",

  MainToolbar: "main.MainToolbar",

  LogoText: D.t("WIALON"),

  NavigationTree: [
    {
      text: "Entities",
      iconCls: "x-fa fa-puzzle-piece",
      children: [
        {
          text: "Realms",
          view: "Crm.modules.realm.view.RealmGrid",
          iconCls: "x-fa fa-venus-mars"
        },
        {
          text: "Organizations",
          view: "Crm.modules.organizations.view.OrganizationsGrid",
          iconCls: "x-fa fa-users"
        },
        {
          text: "Users",
          view: "Crm.modules.accountHolders.view.UsersGrid",
          iconCls: "x-fa fa-users"
        },
        {
          text: "Request to Registration",
          view:
            "Crm.modules.requestToRegistration.view.RequestToRegistrationGrid",
          iconCls: "x-fa fa-question-circle"
        },
        {
          text: "Certain Permissions",
          view: "Crm.modules.certainPermissions.view.CertainPermissionsGrid",
          iconCls: "x-fa fa-list"
        }
      ]
    },

    {
      text: "Support",
      view: "Crm.modules.support.view.SupportGrid",
      iconCls: "x-fa fa-question"
    },
    {
      text: "Custom Report Request",
      view: "Crm.modules.customReports.view.customReportsGrid",
      iconCls: "x-fa fa-file-text"
    },
    {
      text: "Settings",
      iconCls: "x-fa fa-wrench",
      children: [
        {
          text: "Admins",
          view: "Crm.modules.users.view.UsersGrid",
          iconCls: "x-fa fa-users"
        },
        {
          text: "Groups",
          view: "Crm.modules.users.view.GroupsGrid",
          iconCls: "x-fa fa-group"
        },
        {
          text: "Roles",
          view: "Crm.modules.roles.view.RolesGrid",
          iconCls: "x-fa fa-group"
        },
        {
          text: "Reports",
          view: "Crm.modules.permissions.view.PermissionsForm",
          iconCls: "x-fa fa-group"
        },
        {
          text: "Download Reports",
          view: "Crm.modules.reports.view.ReportsGrid",
          iconCls: "x-fa fa-list"
        },
        {
          text: "Workflow settings",
          view: "Crm.modules.signset.view.SignsetGrid",
          iconCls: "x-fa fa-briefcase"
        },
        // {
        //   text: "Logs",
        //   view: "Crm.modules.logs.view.LogsGrid",
        //   iconCls: "x-fa fa-key"
        // },
        {
          text: "Tax Information",
          view: "Crm.modules.taxInformations.view.TaxInformationsGrid",
          iconCls: "x-fa fa-info-circle"
        },
        {
          text: "Letters templates",
          view: "Crm.modules.letterTemplates.view.letterTemplatesGrid",
          iconCls: "x-fa fa-envelope-o"
        },
        {
          text: "Transporters",
          view: "Crm.modules.transporters.view.TransporterGrid",
          iconCls: "x-fa fa-list"
        },
        {
          text: "Packages",
          view: "Crm.modules.ratesPackages.view.RatesPackagesGrid",
          iconCls: "x-fa fa-info-circle"
        },
        {
          text: "Reference",
          view: "Crm.modules.references.view.ReferencesGrid",
          iconCls: "x-fa fa-info-circle"
        },
        {
          text: "System Variables",
          view: "Crm.modules.systemVariables.view.SystemVariablesGrid",
          iconCls: "x-fa fa-cogs"
        },
        {
          text: "Admin actions logs",
          view: "Crm.modules.adminLogs.view.adminLogsGrid",
          iconCls: "x-fa fa-eye"
        }
      ]
    },
    {
      text: "Plugins",
      iconCls: "x-fa fa-puzzle-piece",
      children: [
        {
          text: "Plugins",
          view: "Crm.modules.plugins.view.PluginsGrid",
          iconCls: "x-fa fa-puzzle-piece"
        },
        {
          text: "Organization plugins",
          view: "Crm.modules.plugins.view.OrganizationPluginsGrid",
          iconCls: "x-fa fa-puzzle-piece"
        }
      ]
    },
    {
      text: "Fuel Cards",
      iconCls: "x-fa fa-credit-card",
      children: [
        {
          text: "Aggregators",
          view: "Crm.modules.aggregators.view.AggregatorsGrid",
          iconCls: "x-fa fa-university"
        },
        {
          text: "Permissions organization accounts",
          view:
            "Crm.modules.organizationAggregatorAccounts.view.OrganizationAggregatorAccountPermissionsGrid",
          iconCls: "x-fa fa-cog"
        },
        {
          text: "Aggregator accounts",
          view:
            "Crm.modules.organizationAggregatorAccounts.view.OrganizationAggregatorAccountsGrid",
          iconCls: "x-fa fa-cog"
        },
        {
          text: "User permissions",
          view:
            "Crm.modules.organizationAggregatorAccounts.view.UserOrganizationAggregatorAccountPermissionsGrid",
          iconCls: "x-fa fa-cog"
        },
        {
          text: "Cards",
          view: "Crm.modules.cards.view.CardsGrid",
          iconCls: "x-fa fa-credit-card"
        },
        {
          text: "Logs for API",
          view: "Crm.modules.logsForApi.view.LogsForApiGrid",
          iconCls: "x-fa fa-key"
        }
      ]
    },
    {
      text: "Online users",
      view: "Crm.modules.onlineMonitoring.view.OnlineMonitoringUsersGrid",
      iconCls: "x-fa fa-group"
    },
    {
      text: "Reports in process",
      view: "Crm.modules.onlineMonitoring.view.OnlineMonitoringReportsGrid",
      iconCls: "x-fa fa-list"
    }
  ]
};
