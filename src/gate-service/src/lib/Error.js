const ERROR_MESSAGES = {
  RU: {
    SERVERACCESSDENIED: "Сервер сервиса не доступен.",
    INPDATAFORMAT: "Ошибка в формате входных данных.",
    VERSION: "Версия API указанная в запросе не соответствует текущей.",
    ACCESSDENIED: "Нет доступа для пользователя.",
    CAPTCHAEXPECTED: "Не верно введен текст с картинки.",
    USERNOTFOUND: "Пользователь не найден.",
    ACTIVATIONCODEWRONG: "Код активации недействителен.",
    ACTIVATIONCODEREQUIRED: "Пожалуйста, предоставьте код активации.",
    EMAILALREADYVERIFIED: "Ваш адрес электронной почты уже подтвержден.",
    NOTACTIVATEDACCOUNT:
      "Пожалуйста, активируйте свою учетную запись и затем войдите в систему.",
    EMAILEXPECTED: "Пожалуйста, укажите адрес электронной почты.",
    INVALIDDATA: "Пожалуйста, предоставьте действительные данные.",
    USEREXISTS: "Пользователь уже существует.",
    RECORDNOTFOUND: "Запись не найдена.",
    LOGINERROR: "Пожалуйста, введите действительные учетные данные.",
    INVALIDEMAIL: "Пожалуйста, введите действительный адрес электронной почты.",
    INVALIDPASSWORD: "Пожалуйста, введите действительный пароль.",
    LEGALNAMEISEMPTY: "Пожалуйста, введите действительное имя.",
    INVALIDURL: "Неверная ссылка.",
    LOGINBLOCKED: "Логин заблокирован.",
    PASSWORDSDONOTMATCH:
      "Текущий пароль указан неверно. Пожалуйста, убедитесь в том, что нигде не допустили ошибки при вводе пароля.",
    TOKENEXISTS: "Токен уже существует",
    WIALONLOGINERROR: "Ошибка входа в аккаунт Wialon с предоставленным токеном",
    WIALONAPIERROR: "Ошибка вызова API Wialon",
    WIALONPARSEERROR: "Ошибка разбора данных Wialon",
    WIALONTIMEOUT: "Тайм-аут сервера Wialon. Пожалуйста, попробуйте еще раз.",
    WIALON_INVALIDSESSION: "Недействительная сессия.",
    WIALON_INVALIDSERVICE: "Неверное имя сервиса.",
    WIALON_INVALIDRESPONSE: "Неверный результат.",
    WIALON_INVALIDREQUEST: "Неверный ввод.",
    WIALON_ERROREXECUTEREQUEST:
      "Ошибка выполнения запроса. Вероятно, выбранный Вами ТС не имеет необходимого оборудования для выполнения команды. Пожалуйста, убедитесь, что выбранный ТС поддерживает выполнение данной команды.",
    WIALON_UNKNOWNERROR: "Неизвестная ошибка.",
    WIALON_ACCESSDENIED:
      "Обнаружена попытка обращения к объекту, к которому нет прав у текущей учётной записи! Пожалуйста, убедитесь, что вы находитесь в верной учётной записи и повторите попытку.",
    WIALON_INVALIDNAMEPASSWORD:
      "Неверный пароль или имя пользователя. Так же, возможно, что токен использовавшийся для выполнения запросов истёк.",
    WIALON_AUTHSERVICENOTAVAILABLE:
      "Сервер авторизации недоступен, пожалуйста попробуйте повторить запрос позже.",
    WIALON_LIMITREQUEST: "Превышен лимит одновременных запросов.",
    WIALON_ERRORBILLING: "Ошибка биллинга.",
    WIALON_EMPTYMESSAGE: "Нет сообщений для выбранного интервала.",
    WIALON_BILLING_OR_UNIQUE_RESTRICTION:
      "Элемент с таким уникальным свойством уже существует или Невозможно создать элемент в связи с ограничениями биллинга.",
    DATELESSTODAY:
      'Выбранные даты должны быть меньше, чем сегодня, и дата "От" должна быть меньше, чем дата "До".',
    DATEGREATERTODAY:
      'Выбранные даты должны быть больше, чем сегодня, и дата "От" должна быть меньше, чем дата "До".',
    CERTAINPERMISSIONERROR:
      "У данного пользователя нет доступа к выбранному репорту.",
    INVALIDSCHEMA:
      "Введены некорректные данные. Пожалуйста, проверьте обязательные параметры и формат вводимых данных.",
    ROUTENOTFOUND:
      'Указанного репорта не существует. Пожалуйста, проверьте вводимый параметр для репорта. Если вы хотите создать новый отчет, выберите в полях с отчетами опцию "Новый отчет".',
    ROLEUSERISNOTADMIN:
      "Вы не можете совершить данное действие, так как Вы не являетесь администратором организации.",
    FILENOTFOUND: "Файл не найден.",
    TICKETNOTFOUND:
      "Вопрос не найден. Пожалуйста, убедитесь в том, что выбранный вопрос не был удалён.",
    TICKETHASBEENCLOSED:
      "Вопрос был решён или закрыт. Для открытия нового вопроса, пожалуйста, создайте новый вопрос с описанием Вашей проблемы.",
    INVALIDACTIVATIONCODE:
      "Недействительный код активации. Код активации действителен 24 часа с момента его создания. Запросите повторную активацию аккаунта и активируйте его в течении 24 часов.",
    FILEUPLOADERROR: "Ошибка загрузки файла.",
    USERCANNOTBLOCKTHEMSELF:
      "Вы не можете заблокировать свою же учётную запись.",
    USERHASBENNBLOCKEDBYADMIN:
      "Доступ заблокирован администратором. Пожалуйста, обратитесь к администратору Вашей организации.",
    USERNOTREGISTERED:
      "Пользователь с указанным email не зарегистрирован в системе. Пожалуйста, зарегистрируйтесь в системе и активируйте Вашу учётную запись.",
    USERALREADYACTIVATED:
      "Учётная запись уже была активирована. Вы можете авторизоваться в системе.",
    ALOTOFREQUESTSRESENDCODE:
      "Вы уже запросили код активации. Пожалуйста, проверьте Ваш email или подождите 24 часа перед тем как повторно запрашивать код активации.",
    INVALIDTOKEN:
      "Предоставленный токен имеет неверный формат. Пожалуйста, убедитесь в том, что предоставленный токен введён без ошибок и повторите попытку или обратитесь к вашему администратору приложения.",
    EXPIREDTOKEN:
      "Срок действия предоставленного токена истек или токен недействителен. Пожалуйста, убедитесь в том, что срок жизни предоставленного токена не истёк и токен введён без ошибок и повторите попытку или обратитесь к вашему администратору приложения.",
    INVALIDURLHOSTING:
      "Предоставленный URL неверный. Пожалуйста, убедитесь в том, что предоставленный URL введён без ошибок и повторите попытку или обратитесь к вашему администратору приложения.",
    EXTERNALACCOUNTNOTFOUND:
      "В выбранных аккаунтах для ограничения доступа или разрешения доступа к ним передан один или несколько несуществующих в системе аккаунтов. Пожалуйста, обоновите список с внешними аккаунтами, выберите актуальную информацию об аккаунтах и повторите попытку.",
    NOACCESSTODOREQUESTFORCHECK:
      "У этого токена или учетной записи нет доступа для проверки прав токена. Пожалуйста, создайте новый токен в системе, проверьте, есть ли у учетной записи доступ для получения информации об учетной записи или попросите администратора организации сделать все это.",
    NOACCESSTOCREATEREPORT:
      "Нет доступа на создание и удаление отчёта в учетной записи. Данный функционал необходим для использования сервиса. Пожалуйста, обратитесь к администратору Вашей организации для предоставления перечисленного функционала на Вашу учетную запись.",
    NOTCONNECTEDUNITSERVICE:
      "Нет доступа к сервису 'avl_unit' у учетной записи. Данный сервис необходим для использования Repogen. Пожалуйста, обратитесь к администратору Вашей организации для предоставления перечисленного функционала на Вашу учетную запись.",
    NOTCONNECTEDUNITGROUPSERVICE:
      "Нет доступа к сервису 'avl_unit_group' у учетной записи. Данный сервис необходим для использования Repogen. Пожалуйста, обратитесь к администратору Вашей организации для предоставления перечисленного функционала на Вашу учетную запись.",
    NOTCONNECTEDREPORTTEMPLATESSERVICE:
      "Нет доступа к сервису 'reporttemplates' у учетной записи. Данный сервис необходим для использования Repogen. Пожалуйста, обратитесь к администратору Вашей организации для предоставления перечисленного функционала на Вашу учетную запись.",
    SEARCHINGERROR:
      "Во время получения данных произошла ошибка. Пожалуйста, обратитесь в службу поддержки, либо попробуйте повторить попытку чуть позже.",
    DOWNLOADERROR:
      "Во время загрузки произошла ошибка. Пожалуйста, обратитесь в службу поддержки, либо попробуйте повторить попытку чуть позже.",
    NAMEORPASSWORDEXPECTED:
      "В переданных параметрах должен содержаться либо имя, либо пароль, но ни имя, ни пароль не был передан.",
    CHANGEDBRECORDERROR:
      "При записи новой или обновление уже существующей записи в базе данных произошла ошибка. Пожалуйста, обратитесь в службу поддержки.",
    MAILSENDINGERROR:
      "При отправке сообщения на email произошла ошибка. Пожалуйста, обратитесь в службу поддержки.",
    ORGANIZATIONNOTFOUND:
      "По предоставленным данным об организации не найдено совпадений в системе. Пожалуйста, убедитесь, что передаёте правильные данные об организации.",
    NOREFERENCES: "Ссылки не найдены.",
    AGGREGATORNOTFOUND: "Агрегатор не найден",
    LOGINPASSWORDISREQUIRED:
      "Пароль и логин для выбранного агрегатора обязательны для заполнения",
    APIKEYISREQUIRED:
      "API-ключ для выбранного агрегатора обязателен для заполнения",
    CONTRACTNUMBERISREQUIRED:
      "Номер контракта для выбранного агрегатора обязателен для заполнения",
    INVALIDCREDENTIALSFORAGGREGATOR:
      "Введённые данные являются не актуальными и не позволят получить доступ к API агрегатора",
    NOAVAILABLEAGGREGATORS: "Для вашей организации нет доступных Агрегаторов.",
    NOAVAILABLEAGGREGATOR:
      "Агрегатор не разрешен для использования организацией.",
    PLUGINNOTFOUND:
      "По предоставленным данным о плагине не найдено совпадений в системе. Пожалуйста, убедитесь, что передаёте правильные данные о плагине.",
    ORGANIZATIONPLUGINNOTFOUND:
      "По предоставленным данным о плагине организации не найдено совпадений в системе. Пожалуйста, убедитесь, что передаёте правильные данные о плагине организации.",
    PLUGINALREADYREQUESTED:
      "Запрос на подключение плагина отправлен ранее. Пожалуйста, дождитесь решения администратора!",
    PLUGINALREADYCONNECTED: "Данный плагин уже подключен",
    ORGANIZATIONPLUGINNOTAPPROVED:
      "Запрос на подключение плагина не подвержден. Пожалуйста, дождитесь решения администратора!",
    ORGANIZATIONAGGREGATORACCOUNTNOTFOUND:
      "По предоставленным данным об аккаунте агрегатора организации не найдено совпадений в системе. Пожалуйста, убедитесь, что передаёте правильные данные об аккаунте агрегатора организации.",
    USERALREADYHASACCESS: "Пользователю уже открыт доступ",
    FOUNDNOONERECORDFORREPORT: "Нет данных с заданной фильтрацией",
    ORGANIZATIONACCOUNTAGGREGATORNOTFOUND:
      "Указанный аккаунт организации, с данными для авторизации в API агрегатора,  не найден в системе. Пожалуйста, убедитесь в корректности указанного аккаунта.",
    AGGREGATRONOTFOUND:
      "По предоставленным данным об агрегаторе, агрегатор не найден. Пожалуйста, убедитесь, что передаёте правильные данные об агрегаторе.",
    CARDNOTFOUND:
      "По предоставленным данным о карте, карта не найдена. Пожалуйста, убедитесь, что передаёте правильные данные о карте.",
    CARDTOCREATEALREADYEXIST:
      "Карта с таким номер и агрегатором уже существует. Пожалуйста, предоставьте id карты для обновления.",
    CARDWASATTACHEDNOTFROMSERVICE:
      "Карта была привязана к ТС вне данного сервиса. Удалите и снова привяжите карту к ТС в данном приложении",
    NOONETRANSACTIONTODELETE: "Не найдено ни одной транзакции для удаления",
    CARTWITHTHISAGGREGATORALREADYEXIST:
      "Карта с указанным агрегатором уже привязана к выбранному транспортному средству",
    CARTWITHTHISNUMBERALREADYEXIST:
      "Карта с указанным номер уже привязана к выбранному транспортному средству",
    NOONEUNITS: "В учётной записи нет ни одного транспортного средства",
    UNITNOTEXIST: "Выбранное ТС отсутствует на учётной записи или было удалено",
    TIMEOUTOFCHECKWIALONACCOUNT:
      "Сервер, URL котором был указан, не отвечает в течении длительного времени. Пожалуйста, убедитесь в корректности заполненного URL или повторите попытку позже. Если Вы уверены в том, что указан верный URL, пожалуйста, обратитесь в поддержку с подробным описанием Ваших действий.",
    PARAMSSHOULDBEJSON:
      "Параметры должны передаваться в формате JSON. Если проблема возникла на UI, пожалуйста, обратитесь к команде Администраторов / Разработчиков.",
    SVCSHOULDBESTRINGANDNOTEMPTY:
      "SVC должен быть в формате строки и не должен быть пустым. Если проблема возникла на UI, пожалуйста, обратитесь к команде Администраторов / Разработчиков.",
    TAGDETECTED:
      "В введённых данных обнаружены символы связанные с тэгами. Пожалуйста, не используйте их при работе с приложением.",
    NOONEACCOUNTALLOWEDTOUSER:
      "Ни один из аккаунтов организации с авторизационными данными от аккаунта агрегатора не был предоставлен для текущего пользователя. Пожалуйста, обратитесь к администратору Вашей организации с запросом на предоставление доступа к аккаунтам организации с авторизационными данными к аккаунту агрегатора.",
    PASSEDNOTUUID:
      "Для поля, которое предназначено для указания UUID, было передано значение иного формата!",
    USERHASNOORGANIZATION:
      "Текущий пользователь не имеет привязанной организации. Пожалуйста, свяжитесь с командой Администратовов / Разработчиков.",
    ORGANIZATIONALREADYREQUESTEDSANDBOXACCESS:
      "Ваша организация уже запросила доступ к песочнице. Пожалуйста, ожидайте одобрения супервизора.",
    ORGANIZATIONALREADYHASSANDBOXACCESS:
      "У вашей организации уже есть доступ к песочнице.",
    ORGANIZATIONSANDBOXREQUESTWASREJECTED:
      "Запрос вашей организации на получение доступа к Песочнице был отклонен. Пожалуйста, свяжитесь с командой Администратовов / Разработчиков.",
    ORGANIZATIONSANDBOXACCESSWASDEACTIVATED:
      "Доступ к песочнице был деактивирован супервизором. Пожалуйста, свяжитесь с командой Администратовов / Разработчиков.",
    REPORTNOTFOUND:
      "Отчёт по указанным данным не найден. Пожалуйста, убедитесь что переданные данные указаны корректно.",
    NOTFOUNDTRANSACTIONSTOUPLOAD:
      "Не найдено транзакций для загрузки в Wialon.",
    TICKETALREADYCLOSEDORRESOLVED: "Вопрос уже был закрыт или решён.",
    CUSTOMREPORTNOTFOUND:
      "Индивидуальный отчет по переданным учетным данным не найден. Пожалуйста, убедитесь, что Вы владелец этого отчета и id маршрута, id отчета введены правильно.",
    PASSWORDSAVEDBYOLDALGORITHM:
      "Ваш пароль был сохранен, когда мы использовали старый механизм хеширования. Пожалуйста, восстановите пароль.",
    YOUARENOTOWNER:
      "Вы не можете удалить данный отчёт, так как не являетесь его создателем.",
    NOREFERNCEFORSELECTEDREPORT:
      "Не найдено ни одной записи справки для выбранонного отчёта."
  },
  EN: {
    SERVERACCESSDENIED: "Access denied for server.",
    INPDATAFORMAT: "Error in input format.",
    VERSION:
      "The API version specified in the request does not match the current.",
    ACCESSDENIED: "No access for user.",
    CAPTCHAEXPECTED: "Incorrectly entered text from the image.",
    USERNOTFOUND: "User not found.",
    ACTIVATIONCODEWRONG: "Activation code is invalid.",
    ACTIVATIONCODEREQUIRED: "Please provide activation code.",
    EMAILALREADYVERIFIED:
      "Your email already verified, please login to continue.",
    NOTACTIVATEDACCOUNT:
      "Please activate your account and then continue with login.",
    EMAILEXPECTED: "Please provide email.",
    INVALIDDATA: "Please provide valid data.",
    USEREXISTS: "User already exists.",
    RECORDNOTFOUND: "Record not found.",
    LOGINERROR: "Please enter valid credentials.",
    INVALIDEMAIL: "Please enter valid Email.",
    INVALIDPASSWORD: "Please enter valid Password.",
    LEGALNAMEISEMPTY: "Please enter valid Name.",
    INVALIDURL: "Invalid URL.",
    LOGINBLOCKED: "Login Blocked.",
    PASSWORDSDONOTMATCH: "Password does not match.",
    TOKENEXISTS: "Token already exists.",
    WIALONLOGINERROR: "Error loggin into wialon with the token provided.",
    WIALONAPIERROR: "Error while calling wialon API.",
    WIALONPARSEERROR: "Error while parsing wialon result data.",
    WIALONTIMEOUT: "Wialon server timeout, Please try again.",
    WIALON_INVALIDSESSION: "Wialon session was expired.",
    WIALON_INVALIDSERVICE:
      "Wrong name of the Wialon service. Please, contact to the Admin/Dev Team.",
    WIALON_INVALIDRESPONSE:
      "Wrong response from Wialon. Please, contact to the Admin/Dev Team.",
    WIALON_INVALIDREQUEST:
      "Invalid request to the Wialon. Please, contact to the Admin/Dev Team.",
    WIALON_ERROREXECUTEREQUEST:
      "Request execution error. It is likely that the vehicle you have chosen does not have the necessary equipment to execute sent command. Please make sure the selected vehicle supports execute sent command or contact to the Admin/Dev Team.",
    WIALON_UNKNOWNERROR:
      "Unknown error from Wialon. Please, contact to the Admin/Dev Team.",
    WIALON_ACCESSDENIED:
      "An attempt was detected to access an object to which the current account has no permissions! Please, make sure you are using the correct account and try again.",
    WIALON_INVALIDNAMEPASSWORD:
      "Wrong password or username for Wialon account. Also, maybe that token used to execute the request is expired.",
    WIALON_AUTHSERVICENOTAVAILABLE:
      "Wialon auth server is not available at the moment, please, retry once again a little bit later.",
    WIALON_LIMITREQUEST: "Concurrent request limit to the Wialon was exceeded.",
    WIALON_ERRORBILLING:
      "Wialon billing error. Please, make sure that you have permissions to execute this request from your Wialon account.",
    WIALON_EMPTYMESSAGE: "No messages for the selected interval.",
    WIALON_BILLING_OR_UNIQUE_RESTRICTION:
      "An item with this unique property already exists or Item cannot be created due to billing restrictions.",
    DATELESSTODAY:
      "Selected Dates should be less than today and From Date should be less than To Date.",
    DATEGREATERTODAY:
      "Selected Dates should be greater than today and From Date should be less than To Date.",
    CERTAINPERMISSIONERROR:
      "This user does not have access to the selected report.",
    INVALIDSCHEMA:
      "Passed incorrect data. Please, chech required parametrs and format transmitted data.",
    ROUTENOTFOUND:
      'The specified report does not exist. Please check the input parameter for the report. If you want to create a new report, select in fields with reports option "New report"',
    ROLEUSERISNOTADMIN:
      "You can't do this action, because you\re not Organization's Admin.",
    FILENOTFOUND: "File not found.",
    TICKETNOTFOUND:
      "Ticket is not found. Please make sure the selected ticket has not been deleted.",
    TICKETHASBEENCLOSED:
      "The ticket has been resolved or closed. To open a new ticket, please create a new ticket describing your problem.",
    INVALIDACTIVATIONCODE:
      "Invalid activation code. The activation code is only valid for 24 hours from the moment it was created. Request an account reactivation and activate it within 24 hours.",
    FILEUPLOADERROR: "File upload error.",
    USERCANNOTBLOCKTHEMSELF: "You can not block your account by yourself.",
    USERHASBENNBLOCKEDBYADMIN:
      "Access was blocked by administrator. Please, contact to administrator of your organization.",
    USERNOTREGISTERED:
      "The user with the entered email is not registered in the system. Please, register in the system and activate your account.",
    USERALREADYACTIVATED:
      "The account has already been activated. You can log in to the system.",
    ALOTOFREQUESTSRESENDCODE:
      "You have already requested an activation code. Please check your email or wait 24 hours before requesting an activation code again.",
    INVALIDTOKEN:
      "The provided token is not in the correct format. Please ensure that the provided token is entered correctly and try again or contact your application administrator.",
    EXPIREDTOKEN:
      "The provided token has expired or the token is not valid. Please check that the provided token has not expired and that the token was entered without mistakes and try again or contact to your administrator application.",
    INVALIDURLHOSTING:
      "The provided URL is invalid. Please make sure the provided URL is correct and try again or contact your application administrator.",
    EXTERNALACCOUNTNOTFOUND:
      "In the selected accounts, one or more accounts that do not exist in the system were passed to restrict access or allow access to them. Please refresh the list with external accounts, select up-to-date account information about accounts and try again.",
    NOACCESSTODOREQUESTFORCHECK:
      "This token or account has no access to check valid of token. Please, create a new token in the system, check that account has a access to get info about account or ask Admin of the organization to do all of it.",
    NOACCESSTOCREATEREPORT:
      "There is no access to create and delete a report in the account. This functionality is required to use the service. Please contact the administrator of your organization to provide the listed functionality to your account.",
    NOTCONNECTEDUNITSERVICE:
      "No access to service 'avl_unit' in account. This service is required to use Repogen. Please contact the administrator of your organization to provide the listed functionality to your account.",
    NOTCONNECTEDUNITGROUPSERVICE:
      "No access to service 'avl_unit_group' in account. This service is required to use Repogen. Please contact the administrator of your organization to provide the listed functionality to your account.",
    NOTCONNECTEDREPORTTEMPLATESSERVICE:
      "No access to service 'reporttemplates' in account. This service is required to use Repogen. Please contact the administrator of your organization to provide the listed functionality to your account.",
    SEARCHINGERROR:
      "An error occurred while fetching data. Please contact support or try again later.",
    DOWNLOADERROR:
      "An error occurred during the download. Please contact support or try again later.",
    NAMEORPASSWORDEXPECTED:
      "The parameters passed must contain either a name or a password, but neither a username nor a password was passed.",
    CHANGEDBRECORDERROR:
      "An error occurred while writing a new record or updating an existing record in the database. Please contact support.",
    MAILSENDINGERROR:
      "An error occurred while sending the email message. Please contact support.",
    ORGANIZATIONNOTFOUND:
      "The organization information provided did not match the system. Please make sure you are providing the correct organization information.",
    NOREFERENCES: "References not found.",
    AGGREGATORNOTFOUND: "Aggregator not found",
    LOGINPASSWORDISREQUIRED:
      "Password and login for the selected aggregator are required",
    APIKEYISREQUIRED: "The API key for the selected aggregator is required",
    INVALIDCREDENTIALSFORAGGREGATOR:
      "The data entered is not up to date and will not allow access to the aggregator API",
    CONTRACTNUMBERISREQUIRED:
      "The contract number for the selected aggregator is required",
    NOAVAILABLEAGGREGATORS:
      "There are no Aggregators available for your organization.",
    NOAVAILABLEAGGREGATOR:
      "Aggregator is not allowed for use by the organization.",
    PLUGINNOTFOUND:
      "Plugin information provided did not match the system. Please make sure you are providing the correct plugin information.",
    ORGANIZATIONPLUGINNOTFOUND:
      "The organization plugin information provided did not match the system. Please make sure you are providing the correct organization plugin information.",
    PLUGINALREADYREQUESTED:
      "Plugin connection request was sent earlier. Please wait for the administrator's decision!",
    PLUGINALREADYCONNECTED: "Plugin already connected",
    ORGANIZATIONPLUGINNOTAPPROVED:
      "Request to connect the plugin has not been confirmed. Please wait for the administrator's decision!",
    ORGANIZATIONAGGREGATORACCOUNTNOTFOUND:
      "Organization's aggregator account information provided did not match the system. Please make sure you are providing the correct organization's aggregator account information.",
    USERALREADYHASACCESS: "User has already been granted access",
    FOUNDNOONERECORDFORREPORT: "No data with specified filter",
    ORGANIZATIONACCOUNTAGGREGATORNOTFOUND:
      "The specified organization account, with data for authorization in the aggregator API, was not found in the system. Please make sure that the specified account is correct.",
    AGGREGATRONOTFOUND:
      "No aggregator was found based on the provided aggregator data. Please make sure you are providing the correct aggregator data.",
    CARDNOTFOUND:
      "Card not found based on the provided card details. Please make sure you are providing the correct card details.",
    CARDTOCREATEALREADYEXIST:
      "A card with entered number and aggregator already exists. Please, enter id of exists card to update id.",
    CARDWASATTACHEDNOTFROMSERVICE:
      "Card has been linked to a vehicle outside of this service. Delete and relink the card to a vehicle in this app",
    NOONETRANSACTIONTODELETE: "No transactions found to delete",
    CARTWITHTHISAGGREGATORALREADYEXIST:
      "A card with the specified aggregator is already linked to the selected vehicle",
    CARTWITHTHISNUMBERALREADYEXIST:
      "The card with the given number is already linked to the selected vehicle",
    NOONEUNITS: "There are no vehicles in the account",
    UNITNOTEXIST:
      "The selected vehicle is not on the account or has been deleted",
    TIMEOUTOFCHECKWIALONACCOUNT:
      "The server that URL you entered has not responded for a long time. Please, make sure that the URL you entered is correct or try again later. If you are sure that the URL you entered is correct, please contact support with a detailed description of your actions.",
    PARAMSSHOULDBEJSON:
      "Parameters must be passed in JSON format. If the issue is on the UI, please contact the Admins / Developers team.",
    SVCSHOULDBESTRINGANDNOTEMPTY:
      "SVC must be in string format and must not be empty. If the issue is on the UI, please contact the Admins/Developers team.",
    TAGDETECTED:
      "Characters associated with tags were found in the entered data. Please do not use it while working with the application. If you sure, that is an error and you don't used tags, please, contact to the Admins / Developers team.",
    NOONEACCOUNTALLOWEDTOUSER:
      "None of the organization's accounts with authorization data from the aggregator account were provided for the current user. Please contact the administrator of your organization with a request to provide access to the organization's accounts with authorization data for the aggregator account.",
    PASSEDNOTUUID:
      "For a field that is intended to specify a UUID, a value of a different format was passed!",
    USERHASNOORGANIZATION:
      "Current user has not an attached organization. Please, contact to Admin / Dev Team.",
    ORGANIZATIONALREADYREQUESTEDSANDBOXACCESS:
      "Your organization already requested the access to the Sandbox. Please, wait the approve by Supervisor.",
    ORGANIZATIONALREADYHASSANDBOXACCESS:
      "Your organization already has access to the Sandbox.",
    ORGANIZATIONSANDBOXREQUESTWASREJECTED:
      "Request of your organization to get Sandbox access was rejected. Please, contact to the Admin / Dev Team.",
    ORGANIZATIONSANDBOXACCESSWASDEACTIVATED:
      "Your Sandbox access was deactivated by Supervisor. Please, contact to Admin / Dev Team.",
    REPORTNOTFOUND:
      "The report by entered data not found. Please, make sure that the passed data is written correctly.",
    NOTFOUNDTRANSACTIONSTOUPLOAD:
      "Not found transactions to upload into Wialon.",
    TICKETALREADYCLOSEDORRESOLVED: "Ticket already was closed or resolved.",
    CUSTOMREPORTNOTFOUND:
      "Not found custom report by passed credentials. Please, make sure, that you owner of this report and id of route, id of report entered correctly.",
    PASSWORDSAVEDBYOLDALGORITHM:
      "Your password was saved when we used old mecanism of the hash. Please, recover your password.",
    YOUARENOTOWNER:
      "You can't remove this report, because you are not a maker of it.",
    PASSWORDSDONOTMATCH:
      "The current password is incorrect. Please make sure you didn't make any mistakes while entering your password.",
    NOREFERNCEFORSELECTEDREPORT:
      "Not found any record of reference of selected report."
  }
};

export { ERROR_MESSAGES };
