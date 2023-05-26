const customizedRequestReportHtml = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<head>
  <title>Letter</title>
</head>
<body>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
  body {
  }
  .template-table {
      color: #031a23;
      width: 100% !important;
      text-align: center;
      vertical-align: middle;
      min-width: 320px;
      height: 100%;
      padding-bottom: 15px;
      -webkit-font-smoothing: antialiased;
      -webkit-text-size-adjust: none;
  }
  
  h1 {
      color: #031a23;
      font-style: normal;
      font-weight: 400;
      font-size: 48px;
      line-height: 56.25px;
  }
  
  .logo {
      text-align: left;
      display: flex;
      margin: 0 auto;
      position: relative;
      text-decoration: none;
  }
  
  .logo > img {
      height: 70px;
      margin: 0 auto
  }
  
  .logo > span {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      color: #031a23;
      text-transform: uppercase;
      font-weight: 500;
      font-size: 36px;
      line-height: 42px;
      letter-spacing: 0.02em;
      text-decoration: none;
  }
  
  .contact-us,
  .link {
      color: #031a23;
      font-weight: 300;
      font-size: 24px;
      line-height: 33px;
  }</style>
  <table class="template-table">
    <tbody>
      <tr>
        <td>
          <a class="logo" target="_blank" href="https://repogen.getgps.pro"><img src="https://repogen.getgps.pro/logo.png" alt="logo"></a>
        </td>
      </tr>
      <tr>
        <td>
        <h1>Custom report request</h1>
        </td>
      </tr>
      <tr>
        <td>
          <div class="link">
            {#body.text}
            <br>User Name: {#body.name}
            <br>User Email: {#body.email}
            <br>User Id: {#body.id}
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;
export { customizedRequestReportHtml };
