const STRINGS = {
  fixed_monthly_fees: {
    RU: "Фиксированные ежемесячные комиссии",
    EN: "Fixed Monthly Fees"
  },
  fees_plugins: {
    RU: "Комиссии за плагины",
    EN: "Fees for Plugins"
  },
  fees_plugin: {
    RU: "Комиссия за плагин ",
    EN: "Fee for "
  },
  cpu_time_for_reports: {
    RU: "Время CPU для отчета",
    EN: "CPU Time for Reports"
  },
  bytes_from_wialon: {
    RU: "Байт из Wialon",
    EN: "Bytes From Wialon"
  },
  bytes_downloaded: {
    RU: "Байт скачано",
    EN: "Bytes Downloaded"
  },
  employees: {
    RU: "Сотрудники",
    EN: "Employees"
  },
  mobile_cpu_time: {
    RU: "Мобильное время CPU",
    EN: "Mobile CPU Time"
  },
  mobile_bytes_from_wialon: {
    RU: "Мобильные байты из Wialon",
    EN: "Mobile Bytes From Wialon"
  },
  mobile_bytes_downloaded: {
    RU: "Мобильных байт скачано",
    EN: "Mobile Bytes Downloaded"
  },
  mobile_active_users: {
    RU: "Мобильные активные пользователи",
    EN: "Mobile Active Users"
  },
  wialon_accounts: {
    RU: "Аккаунты Wialon",
    EN: "Wialon Accounts"
  },
  downloaded_reports: {
    RU: "Скачано отчетов",
    EN: "Downloaded Reports"
  },
  generated_reports: {
    RU: "Сгенерировано отчетов",
    EN: "Generated Reports"
  },
  from_date: {
    RU: "От",
    EN: "From Date"
  },
  to_date: {
    RU: "До",
    EN: "To Date"
  },
  invoice_date: {
    RU: "Дата квитанции",
    EN: "Invoice Date"
  },
  organization: {
    RU: "Организация",
    EN: "Organization"
  },
  invoice: {
    RU: "Квитанция",
    EN: "Invoice"
  },
  resource_description: {
    RU: "Детали ресурса",
    EN: "Resource Description"
  },
  quantity: {
    RU: "Количество",
    EN: "Quantity"
  },
  amount: {
    RU: "Сумма",
    EN: "Amount"
  },
  adjustment: {
    RU: "Регулировка",
    EN: "Adjustment"
  },
  total_amount: {
    RU: "Итоговая сумма",
    EN: "Total Amount"
  },
  to: {
    RU: "Кому",
    EN: "to"
  },
  till_now: {
    RU: "До настоящего времени",
    EN: "Till Now"
  },
  package: {
    RU: "Пакет",
    EN: "Package"
  },
  resource: {
    RU: "Ресурс",
    EN: "Resource"
  },
  rate: {
    RU: "Тариф",
    EN: "Rate"
  },
  tax: {
    RU: "Чек",
    EN: "Tax"
  },
  usage_report: {
    RU: "Отчет об использовании",
    EN: "Usage Report"
  },
  date: {
    RU: "Дата квитанции",
    EN: "Date"
  }
};

const REPORT_ERROR_STRING = {
  "0": {
    RU: "Ошибка при создании отчета. Пожалуйста, свяжитесь с администратором.",
    EN: "Error generating report. Please contact Admin."
  },
  "4": {
    RU: "Неверный ввод. Пожалуйста, свяжитесь с администратором.",
    EN: "Invalid input. Please contact Admin."
  },
  "5": {
    RU: "Ошибка выполнения запроса. Пожалуйста, свяжитесь с администратором.",
    EN: "Error performing request. Please contact Admin."
  },
  "6": {
    RU: "Неизвестная ошибка. Пожалуйста, свяжитесь с администратором.",
    EN: "Unknown error. Please contact Admin."
  },
  "7": {
    RU:
      "Предоставленный токен не имеет достаточно прав для выполнения операции. Пожалуйста, предоставьте токен в настройках учётной записи с более высоким уровнем прав и повторите попытку или обратитесь к вашему администратору приложения.",
    EN:
      "The provided token does not have sufficient rights to generate the report. Please provide the token in your account settings with higher privileges and try again or contact your application administrator."
  },
  "8": {
    RU:
      "Предоставленный токен является просроченным, удалённым или же несуществующим. Пожалуйста, создайте новый токен, обновите его в своей учётной записи и повторите попытку или обратитесь к вашему администратору приложения.",
    EN:
      "The provided token is expired, deleted, or non-existent. Please create a new token, update it in your account and try again or contact your application administrator."
  },
  "9": {
    RU:
      "Сервер авторизации недоступен, пожалуйста, попробуйте повторить запрос позже.",
    EN: "Authorization server is unavailable, please try again later."
  },
  "10": {
    RU: "Достигнут лимит одновременных запросов.",
    EN: "Reached limit of concurrent requests."
  },
  "11": {
    RU: "Ошибка сброса пароля.",
    EN: "Password reset error."
  },
  "14": {
    RU: "Ошибка биллинга.",
    EN: "Billing error."
  },
  "1005": {
    RU: "Время выполнения превышено.",
    EN: "Execution time exceeded."
  },
  "5001": {
    RU:
      "Недостаточно входных данных для создания отчёта. Пожалуйста, удостоверьтесь в том, что передали все необходимые данные для создания отчёта.",
    EN:
      "Not all params was passed. Please, make sure, what you passed all required data."
  },
  "5002": {
    RU:
      "Не найдено ни одной записи для генерации отчёта. Пожалуйста, попробуйте выбрать другой период или группу/объект.",
    EN:
      "No one record for report. Please, try to select another period or groups/units."
  },
  "5003": {
    RU:
      "Внутренняя ошибка генерации отчёта. Пожалуйста, обратитесь к команде Администраторов/Разработчиков.",
    EN: "Error generating report. Please contact Admin/Dev Team."
  },
  "5004": {
    RU:
      "В выбранном аккаунте внешнего ресурса указан неправильный URL. Пожалуйста, укажите валидный URL и попробуйте сгенерировать отчёт снова или обратитесь к вашему администратору приложения.",
    EN:
      "The selected external resource account has an invalid URL. Please provide a valid URL and try generating the report again or contact your application administrator."
  },
  "5005": {
    RU:
      "В выбранном аккаунте внешнего ресурса  не указан токен и/или неверно указан URL внешнего ресурса. Пожалуйста, укажите токен, убедитесь в том, что URL внешнего ресурса указан верно и попробуйте сгенерировать отчёт снова или обратитесь к вашему администратору приложения.",
    EN:
      "The selected external resource account does not contain a token and/or the URL of the external resource is incorrect. Please provide the token, make sure the URL of the external resource is correct and try generating the report again or contact your application administrator."
  }
};

export { STRINGS, REPORT_ERROR_STRING };
