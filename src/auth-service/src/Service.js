import Base from "@lib/base";
import Captcha from "./lib/Captcha";
import Otp from "./lib/Otp";
import Server from "./lib/Server";
import Signin from "./lib/Signin";
import Signup from "./lib/Signup";
import File from "./lib/FileOperations";
import User from "./lib/User";
import Permissions from "./lib/Permissions";
import Organization from "./lib/Organization";
import Report from "./lib/Report";
import WialonAccount from "./lib/WialonAccount";
import UsageReport from "./lib/UsageReport";
import Invoice from "./lib/Invoice";
import Logs from "./lib/Logs";

export default class Service extends Base {
  publicMethods() {
    return {
      getInvoices: {
        realm: true,
        user: true,
        method: Invoice.getInvoices,
        description: "Get Invoices",
        schema: {
          type: "object",
          properties: {
            year: { type: "integer", minimum: 2000, maximum: 9999 },
            start: { type: ["integer", "null"], minimum: 0 },
            limit: { type: ["integer", "null"], minimum: 1, maximum: 100 }
          },
          required: ["year", "start", "limit"]
        }
      },
      getInvoiceDetails: {
        realm: true,
        user: true,
        method: Invoice.getInvoiceDetails,
        description: "Get Invoice Details",
        schema: {
          type: "object",
          properties: {
            invoiceId: { format: "uuid" }
          },
          required: ["invoiceId"]
        }
      },
      downloadInvoice: {
        realm: true,
        user: true,
        method: Invoice.downloadInvoice,
        description: "Download Invoice",
        schema: {
          type: "object",
          properties: {
            invoiceId: { format: "uuid" }
          },
          required: ["invoiceId"]
        }
      },
      downloadUsageReport: {
        realm: true,
        user: true,
        method: UsageReport.downloadUsageReport,
        description: "Download Usage Report",
        schema: {
          type: "object",
          properties: {
            invoiceId: { format: "uuid" }
          },
          required: ["invoiceId"]
        }
      },
      getUsageReport: {
        realm: true,
        user: true,
        method: UsageReport.getUsageReport,
        description: "Get Usage Report",
        schema: {
          type: "object",
          properties: {
            invoiceId: { format: "uuid" }
          },
          required: ["invoiceId"]
        }
      },
      listGenertatedReports: {
        realm: true,
        user: true,
        method: Report.listGenertatedReports,
        description: "List Generated Reports",
        schema: {
          type: "object",
          properties: {
            start: { type: ["integer", "null"], minimum: 0 },
            limit: { type: ["integer", "null"], minimum: 1, maximum: 100 }
          },
          required: ["start", "limit"]
        }
      },
      downloadReport: {
        realm: true,
        user: true,
        method: Report.downloadReport,
        description: "Download Report"
      },
      listUserWialonAccounts: {
        realm: true,
        user: true,
        method: WialonAccount.listUserWialonAccounts,
        description: "list User Wialon Accounts",
        schema: {
          type: "object",
          properties: {
            userId: { format: "uuid" }
          },
          required: ["userId"]
        }
      },
      getAccessibleWialonAccounts: {
        realm: true,
        user: true,
        method: WialonAccount.getAccessibleWialonAccounts,
        description: "Get Accessible Wialon Accounts",
        schema: {
          type: "object",
          properties: {
            start: { type: ["integer", "null"], minimum: 0 },
            limit: { type: ["integer", "null"], minimum: 1, maximum: 100 }
          },
          required: ["start", "limit"]
        }
      },
      setAccountsAccess: {
        realm: true,
        user: true,
        method: WialonAccount.setAccountsAccess,
        description: "Set accounts access to user",
        schema: {
          type: "object",
          properties: {
            userId: { format: "uuid" },
            accountsId: {
              type: "array",
              items: { type: "number" }
            }
          },
          required: ["userId", "accountsId"]
        },
        log: true
      },
      listWialonAccounts: {
        realm: true,
        user: true,
        method: WialonAccount.listWialonAccounts,
        description: "list wialon accounts",
        schema: {
          type: "object",
          properties: {
            start: { type: ["integer", "null"], minimum: 0 },
            limit: { type: ["integer", "null"], minimum: 1, maximum: 100 }
          },
          required: ["start", "limit"]
        }
      },
      listWialonAccountsForUser: {
        realm: true,
        user: true,
        method: WialonAccount.listWialonAccountsForUser,
        description: "List wialon accounts for invited user",
        schema: {
          type: "object",
          properties: {
            start: { type: ["integer", "null"], minimum: 0 },
            limit: { type: ["integer", "null"], minimum: 1, maximum: 100 }
          },
          required: ["start", "limit"]
        }
      },
      removeWialonAccount: {
        realm: true,
        user: true,
        method: WialonAccount.removeWialonAccount,
        description: "Remove wialon account",
        schema: {
          type: "object",
          properties: {
            wialon_acc_id: { type: "number" }
          },
          required: ["wialon_acc_id"]
        },
        log: true
      },
      addWialonAccount: {
        realm: true,
        user: true,
        method: WialonAccount.addWialonAccount,
        description: "Add wialon account",
        schema: {
          type: "object",
          properties: {
            wialon_username: { type: "string", maxLength: 255 },
            wialon_hosting_url: { type: "string", maxLength: 255 },
            wialon_token: {
              type: ["string", "null"],
              minLength: 1,
              maxLength: 255
            },
            is_test: {
              type: "boolean"
            }
          },
          required: ["wialon_token", "wialon_username", "wialon_hosting_url"]
        },
        log: true,
        secureResponse: {
          wialon_token: true
        }
      },
      updateWialonAccount: {
        realm: true,
        user: true,
        method: WialonAccount.updateWialonAccount,
        description: "Update wialon account",
        schema: {
          type: "object",
          properties: {
            wialonAccId: { type: "number" },
            wialon_username: { type: "string", maxLength: 255 },
            wialon_hosting_url: { type: "string", maxLength: 255 },
            wialon_token: {
              type: ["string", "null"],
              minLength: 1,
              maxLength: 255
            },
            is_test: {
              type: "boolean"
            }
          },
          required: [
            "wialonAccId",
            "wialon_username",
            "wialon_hosting_url",
            "wialon_token"
          ]
        },
        log: true
      },
      getReportRoutes: {
        realm: true,
        user: true,
        method: Report.getReportRoutes,
        description: "Get permitted routes",
        schema: {
          type: "object",
          properties: {
            start: { type: ["integer", "null"], minimum: 0 },
            limit: { type: ["integer", "null"], minimum: 1, maximum: 100 }
          },
          required: ["start", "limit"]
        }
      },
      customizedRequestReport: {
        realm: true,
        user: true,
        method: Report.customizedRequestReport,
        description: "Request Customized Report",
        schema: {
          type: "object",
          properties: {
            text: { type: "string" }
          },
          required: ["text"]
        },
        log: true
      },
      getOrganizationDetails: {
        realm: true,
        user: true,
        method: Organization.getOrganizationDetails,
        description: "Get Organization Details"
      },
      updateOrganizationDetails: {
        realm: true,
        user: true,
        method: Organization.updateOrganizationDetails,
        description: "Update Organization",
        schema: {
          type: "object",
          properties: {
            organization_name: { type: "string", maxLength: 255 }
          },
          required: ["organization_name"]
        },
        log: true
      },
      changeUserAccessLevel: {
        realm: true,
        user: true,
        method: User.changeUserAccessLevel,
        description: "Change User Access Level",
        schema: {
          type: "object",
          properties: {
            access_level: { type: "number", minimum: 0 },
            user_id: {
              type: "string",
              format: "uuid",
              minLength: 36,
              maxLength: 36
            }
          },
          required: ["access_level", "user_id"]
        },
        log: true
      },
      toggleUserStatus: {
        realm: true,
        user: true,
        method: User.toggleUserStatus,
        description: "Change User Status",
        schema: {
          type: "object",
          properties: {
            user_id: {
              type: "string",
              format: "uuid",
              minLength: 36,
              maxLength: 36
            }
          },
          required: ["user_id"]
        },
        log: true,
        secureResponse: {
          pass: true,
          wialon_token: true
        }
      },
      getOrganizationUsers: {
        realm: true,
        user: true,
        method: Organization.getOrganizationUsers,
        description: "Get Organization Users",
        schema: {
          type: "object",
          properties: {
            start: { type: ["integer", "null"], minimum: 0 },
            limit: { type: ["integer", "null"], minimum: 1, maximum: 100 }
          },
          required: ["start", "limit"]
        }
      },
      userVerification: {
        realm: true,
        method: Signup.userVerification,
        description: "User Verification",
        schema: {
          type: "object",
          properties: {
            hash: { type: "string" }
          },
          required: ["hash"]
        },
        log: true
      },
      changePermission: {
        realm: true,
        user: true,
        method: Permissions.changePermission,
        description: "Set Permissions",
        schema: {
          type: "object",
          properties: {
            role_id: {
              type: "string",
              format: "uuid",
              minLength: 36,
              maxLength: 36
            },
            route_id: {
              type: "string",
              format: "uuid",
              minLength: 36,
              maxLength: 36
            },
            is_permissible: { type: "boolean" }
          },
          required: ["role_id", "route_id", "is_permissible"]
        },
        log: true
      },
      getPermissionInfo: {
        realm: true,
        user: true,
        method: Permissions.getPermissionInfo,
        description: "Get Permissions",
        schema: {
          type: "object",
          properties: {
            start: { type: ["integer", "null"], minimum: 0 },
            limit: { type: ["integer", "null"], minimum: 1, maximum: 100 },
            invoiceId: { type: "string" }
          },
          required: ["start", "limit"]
        }
      },
      getRoutesByTypeAndOrganization: {
        realm: true,
        user: true,
        method: Permissions.getRoutesByTypeAndOrganization,
        description: "Get Permissions by type",
        schema: {
          type: "object",
          properties: {
            start: { type: ["integer", "null"], minimum: 0 },
            limit: { type: ["integer", "null"], minimum: 1, maximum: 100 },
            type: { type: "integer", minimum: 0, maximum: 2 }
          },
          required: ["type"]
        }
      },
      signupAdmin: {
        realm: true,
        method: Signup.signupAdmin,
        description: "Creating new user role Admin",
        schema: {
          type: "object",
          properties: {
            email: { type: "string", maxLength: 255 },
            name: { type: "string", maxLength: 255 },
            password: { type: "string", maxLength: 255, secure: true },
            organization_name: { type: "string", maxLength: 255 },
            wialon_token: {
              type: ["string", "null"],
              minLength: 1,
              maxLength: 255,
              secure: true
            },
            wialon_hosting_url: { type: "string", maxLength: 255 },
            captcha: { type: "string", maxLength: 50 },
            token: { type: "string", maxLength: 255, secure: true }
          },
          required: [
            "email",
            "name",
            "organization_name",
            "wialon_hosting_url",
            "captcha",
            "token"
          ]
        },
        secureResponse: {
          pass: true,
          wialon_token: true
        },
        log: true
      },
      signupUser: {
        realm: true,
        method: Signup.signupUser,
        description: "Creating new user role User",
        schema: {
          type: "object",
          properties: {
            organization_id: {
              type: "string",
              format: "uuid",
              minLength: 36,
              maxLength: 36
            },
            email: { type: "string", maxLength: 100, format: "email" },
            name: { type: "string", maxLength: 50 },
            password: { type: "string", maxLength: 100, secure: true },
            token: { type: "string", secure: true }
          },
          required: ["organization_id", "password", "email", "name"]
        },
        log: true,
        secureResponse: {
          pass: true,
          wialon_token: true
        }
      },
      signin: {
        realm: true,
        method: Signin.signin,
        description: "Login",
        schema: {
          type: "object",
          properties: {
            login: { type: "string", format: "email" },
            pass: { type: "string", secure: true }
          },
          required: ["login", "pass"]
        },
        secureResponse: {
          token: true
        }
      },
      inviteUser: {
        realm: true,
        user: true,
        method: Signup.inviteUser,
        description: "Creating new user",
        schema: {
          type: "object",
          properties: {
            email: { type: "string", maxLength: 100 }
          },
          required: ["email"]
        },
        log: true
      },
      updateProfile: {
        realm: true,
        user: true,
        method: User.updateProfile,
        description: "Update user profile",
        schema: {
          type: "object",
          properties: {
            password: { type: "string", maxLength: 100, secure: true },
            name: { type: "string", maxLength: 50 }
          }
        },
        log: true
      },
      getCaptcha: {
        realm: true,
        method: Captcha.getCaptcha,
        description: "Getting captcha svg",
        schema: {
          type: "object",
          properties: {
            background: { type: "string" },
            token: { type: "string" }
          },
          required: ["background", "token"]
        }
      },
      verifyCode: {
        realm: true,
        method: Signup.verifyCode,
        description: "Verify code",
        schema: {
          type: "object",
          properties: {
            email: { type: "string", maxLength: 100 },
            code: {
              type: "object",
              properties: {
                code: { type: "string" }
              },
              secure: true
            }
          },
          required: ["email", "code"]
        },
        log: true
      },
      checkCaptcha: {
        realm: true,
        method: Captcha.checkCaptcha,
        description: "Checking captcha text"
      },
      permissedMethod: {
        realm: true,
        method: Server.permissedMethod,
        description: "Test permissions"
      },
      getServerByToken: {
        method: Server.getServerByToken,
        description: "Getting ServerId by authorization token"
      },
      getServerPermissions: {
        realm: true,
        method: Server.getServerPermissions,
        description: "Getting Server Permissions"
      },
      checkOtp: {
        realm: true,
        method: Otp.check,
        description: "Checking one time password"
      },
      sendOtp: {
        realm: true,
        method: Otp.send,
        description: "Sending one time password to user"
      },
      getPublicMethods: {
        method: Server.getPublicMethods,
        description: "Test public methods"
      },
      getProfileDetails: {
        realm: true,
        user: true,
        method: User.getProfileDetails,
        description: "Get profile"
      },
      changePassword: {
        realm: true,
        user: true,
        method: User.changePassword,
        description: "Change Password",
        schema: {
          type: "object",
          properties: {
            password: {
              type: "string",
              minLength: 8
            },
            new_password: {
              type: "string",
              minLength: 8
            }
          },
          required: ["password", "new_password"]
        },
        log: true
      },
      passwordReminder: {
        realm: true,
        method: User.passwordReminder,
        description: "Password reminder",
        schema: {
          type: "object",
          properties: {
            email: {
              format: "email"
            }
          },
          required: ["email"]
        },
        log: true
      },
      confirmEmail: {
        realm: true,
        method: User.confirmEmail,
        description: "Confirm email",
        log: true
      },
      pushFile: {
        realm: true,
        user: true,
        method: File.pushFile,
        description: "Push file method",
        schema: {
          type: "object",
          properties: {
            name: { type: "string", maxLength: 255 },
            data: { type: "string" },
            size: { type: "number", maximum: 8 }
          },
          required: ["name", "data", "size"]
        }
      },
      pullFile: {
        realm: true,
        user: true,
        method: File.pullFile,
        description: "Pull file method",
        schema: {
          type: "object",
          properties: {
            code: { type: "string" }
          },
          required: ["code"]
        }
      },
      delFile: {
        realm: true,
        user: true,
        method: File.delFile,
        description: "Delete file method",
        schema: {
          type: "object",
          properties: {
            code: { type: "string" }
          },
          required: ["code"]
        }
      },
      acceptFile: {
        realm: true,
        user: true,
        method: File.acceptFile,
        description: "Accept files method",
        schema: {
          type: "object",
          properties: {
            name: { type: "string", maxLength: 255 },
            data: {
              type: "object",
              properties: {
                name: { type: "string", maxLength: 255 },
                data: {
                  type: "object",
                  properties: {
                    code: { type: "string" }
                  }
                }
              }
            }
          },
          required: ["name", "data"]
        }
      },
      statusFile: {
        realm: true,
        user: true,
        method: File.statusFile,
        description: "Status files method",
        schema: {
          type: "object",
          properties: {
            code: { type: "string" }
          },
          required: ["code"]
        }
      },
      watermarkFile: {
        realm: true,
        user: true,
        method: File.watermarkFile,
        description: "Watermark files method",
        schema: {
          type: "object",
          properties: {
            code: {
              type: "object",
              properties: {
                code: { type: "string" }
              }
            }
          },
          required: ["code"]
        }
      },
      signout: {
        realm: true,
        user: true,
        method: Signin.signout,
        description: "Sign out from UI",
        schema: {
          type: "object",
          properties: {
            token: { type: "string", secure: true }
          },
          required: ["token"]
        },
        log: true
      },
      getLoginedUsers: {
        realm: true,
        user: true,
        method: User.getLoginedUsers
      },
      getCustomReportAccess: {
        realm: true,
        user: true,
        method: User.getCustomReportAccess
      },
      setCustomReportAccess: {
        realm: true,
        user: true,
        method: User.setCustomReportAccess,
        description: "Setting access to a custom report",
        schema: {
          type: "object",
          properties: {
            customReportAccess: { type: "number" }
          },
          required: ["customReportAccess"]
        },
        log: true,
        secureResponse: {
          pass: true,
          wialon_token: true
        }
      },
      hideRecordOfGeneratedReport: {
        realm: true,
        user: true,
        method: Report.hideRecordOfGeneratedReport,
        description: "Hide record of the generated reports",
        schema: {
          type: "object",
          properties: {
            id: { type: "number" }
          },
          required: ["id"]
        }
      },
      registrationForPresentation: {
        realm: true,
        user: false,
        method: Signup.registrationForPresentation,
        description: "Signup for presentation",
        schema: {
          type: "object",
          properties: {
            name: { type: "string", maxLength: 255, minLength: 3 },
            company: { type: "string", maxLength: 255, minLength: 3 },
            website: { type: "string", maxLength: 255, minLength: 3 },
            is_wialon_accounts_exists: { type: "boolean" },
            wishes: { type: "string", minLength: 3 },
            phone_number: { type: "string", maxLength: 20, minLength: 3 },
            email: { type: "string", maxLength: 256, minLength: 3 }
          },
          required: [
            "name",
            "company",
            "website",
            "is_wialon_accounts_exists",
            "wishes",
            "phone_number",
            "email"
          ]
        }
      },
      resendVerifyCode: {
        realm: true,
        user: false,
        method: Signup.resendVerifyCode,
        description: "Resend verify code, if link to activate was expired.",
        schema: {
          type: "object",
          properties: {
            email: {
              type: "string"
            },
            is_test: {
              type: "boolean"
            }
          },
          required: ["email"]
        }
      },
      listWialonAccountsToGenerateReport: {
        realm: true,
        user: true,
        method: WialonAccount.listWialonAccountsToGenerateReport,
        description: "Get all available external accounts to generate report.",
        schema: {
          type: "object",
          properties: {
            start: { type: ["integer", "null"], minimum: 0 },
            limit: { type: ["integer", "null"], minimum: 1, maximum: 100 }
          },
          required: ["start", "limit"]
        }
      },
      signupAdminFromAdminPanel: {
        private: true,
        method: Signup.signupAdminFromAdminPanel,
        description: "Signup new admin-user and them organization",
        schema: {
          type: "object",
          properties: {
            email: { type: "string" },
            name: { type: "string" },
            organization_name: { type: "string" },
            lang: { type: "string" },
            realm_id: {
              type: "string",
              format: "uuid",
              minLength: 36,
              maxLength: 36
            }
          },
          required: ["email", "name", "organization_name", "lang", "realm_id"]
        },
        log: true
      },
      rejectUserRequest: {
        realm: true,
        user: true,
        method: Signup.rejectUserRequest,
        description:
          "Reject request of the user to registration in the Repogen",
        schema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              minLength: 36,
              maxLength: 36
            },
            email: { type: "string", format: "email" },
            realm_id: {
              type: "string",
              format: "uuid",
              minLength: 36,
              maxLength: 36
            },
            lang: { type: "string" },
            reject_reason: { type: "string" }
          },
          required: ["id", "email", "realm_id", "lang", "reject_reason"]
        },
        log: true
      },
      insertLogs: {
        realm: false,
        user: false,
        method: Logs.insertLogs,
        description: "Insert logs",
        schema: {
          type: "object",
          properties: {
            action: { type: "string" },
            user_id: {
              type: "string",
              format: "uuid",
              minLength: 36,
              maxLength: 36
            },
            message: { type: "string" },
            data: { type: "string" }
          },
          required: ["action", "user_id", "message", "data"]
        }
      },
      updatePreferredLang: {
        realm: true,
        user: true,
        method: User.updatePreferredLang,
        description: "Change the preferred language of the user",
        schema: {
          type: "object",
          properties: {}
        }
      },
      requestToGetSandboxAccess: {
        realm: true,
        user: true,
        method: Organization.requestToGetSandboxAccess,
        description: "Send request to get sandbox access",
        schema: {
          type: "object",
          properties: {}
        }
      },
      notifyOrganizationAdminsAboutAccessToSandbox: {
        private: true,
        method: Organization.notifyOrganizationAdminsAboutAccessToSandbox,
        description:
          "Notify all admins of the organizations to that was approved access to Sandbox",
        schema: {
          type: "object",
          properties: {
            organization_id: {
              format: "uuid"
            }
          },
          required: ["organization_id"]
        }
      }
    };
  }
}
