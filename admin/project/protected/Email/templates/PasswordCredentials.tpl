<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"> 
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Account Details</title>
  
</head>

<body style="margin: 0; padding: 0; min-width: 100%!important;">

<table width="100%"  border="0" style="margin-top:15px;" cellpadding="0" cellspacing="0">
<tr>
  <td>    
    <table bgcolor="#f2f5ff" class="content" align="center" style="width: 100%; max-width: 600px;" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td bgcolor="#12246c" class="header" style="padding: 30px 30px 30px 30px;text-align: center;">
                <img src="http://88.99.171.147:8080/images/logo-dark.png" style="height:50px;margin:0 auto;">
            </td>
        </tr>
        <tr>
            <td class="innerpadding borderbottom" style="border-bottom: 1px solid #ddd;padding: 30px 30px 30px 30px;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                <td class="h2" style="padding: 0 0 10px 0; font-size: 20px;color: #153643; font-family: sans-serif; line-height: 20px; font-weight: bold;">
                Hello {data.name},
                </td>
                </tr>
                <tr>
                <td class="bodycopy" style="font-size: 16px; line-height: 22px;color: #153643; font-family: sans-serif;">
                 {data.text}
                </td>
                </tr>
            </table>
            </td>
        </tr>
        <tr>
            <td class="innerpadding borderbottom detail-box" style="border-bottom: 1px solid #ddd;padding: 30px 30px 30px 30px;">
                <table width="100%" border="0" style="border-collapse: collapse;" cellspacing="0" cellpadding="0">
                    <tr>
                        <th colspan="2" class="h2" style=" color: #153643; font-family: sans-serif; padding: 0 0 10px 0; font-size: 20px; line-height: 20px; font-weight: bold;border: 1px solid #153643;padding: 10px;" align="left">Portal Login Credentials</th>
                    </tr>
                    <tr>
                        <td style=" border: 1px solid #153643;padding: 10px;font-size: 16px; line-height: 22px;color: #153643; font-family: sans-serif;" class="bodycopy">
                            Login
                        </td>
                        <td style=" border: 1px solid #153643;padding: 10px; font-size: 16px; line-height: 22px;color: #153643; font-family: sans-serif;" class="bodycopy">
                            {data.email}
                        </td>
                    </tr>
                    <tr>
                        <td style=" border: 1px solid #153643;padding: 10px; font-size: 16px; line-height: 22px;color: #153643; font-family: sans-serif;" class="bodycopy">
                            Password
                        </td>
                        <td style=" border: 1px solid #153643;padding: 10px;font-size: 16px; line-height: 22px;color: #153643; font-family: sans-serif;" class="bodycopy">
                            {data.password}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td class="innerpadding borderbottom" style="border-bottom: 1px solid #ddd;padding: 30px 30px 30px 30px;">
                <table width="100%" border="0" class="buttonwrapper" cellspacing="0" cellpadding="0">
                    <tr>
                        <td class="button" style="text-align: center; font-size: 18px; font-family: sans-serif; font-weight: bold; padding: 0 30px 0 30px;" height="45">
                        <a href={data.base_url}/auth/login style="background-color: #12246c !important; padding: 10px 20px 10px 20px!important; min-width: 100px; display: inline-block; border-radius: 30px; margin-left: 15px; margin-right: 15px;color: #ffffff; text-decoration: none !important;">Login</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

      
        <tr>
            <td class="footer" style="padding: 20px 30px 15px 30px;" bgcolor="#44525f">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                <td align="center" class="footercopy" style="font-family: sans-serif; font-size: 14px; color: #ffffff;">
                    <!-- &reg; Someone, somewhere 20XX<br/> -->
                    <a href={data.base_url} style="color: #ffffff; text-decoration: underline;" class="unsubscribe"><font color="#ffffff">nr.getgps.eu</font></a> 
                    <!-- <span class="hide">nr.getgps.eu</span><br> -->
                </td>
                </tr>
            </table>
            </td>
        </tr>
    </table>
    </td>
  </tr>
</table>
</body>
</html>
