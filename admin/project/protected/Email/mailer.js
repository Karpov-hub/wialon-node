Ext.define('Crm.Email.mailer', {
    extend: "Core.Controller",
    debug:true,
    test:function(){
        this.sendEmail({
            to:'db154@enovate-it.com',
            templateId:'test',
            subject:"TEST EMAIL"
        },function(err,res){
            console.log(err);
        });
    },
    sendEmail: function (data, cb) {
        var me = this;
        var mailConfig=me.config.mail;
        [
            function (next) {
                if(!data.to){
                    if (me.debug) {
                        console.log('To email is not defined not sending email');
                    }
                    return cb();
                }
                if (me.debug) {
                    console.log('Sending email', JSON.stringify(data.templateId));
                }
                if(data.templateData){
                    var templateData=Ext.clone(data.templateData);
                }else{
                    templateData={};
                }
                templateData=Ext.apply(templateData,{UTIL:Ext.create('Crm.Utils.Util',{scope:me})});
                
                if (data.templateId) {
                    me.tplApply('Crm.Email.templates.'+data.templateId, {
                        data: templateData,
                        cfg: me.config
                    }, function (html) {
                        next(html,undefined);
                    });
                } else {
                    next(undefined, data.text || "");
                }
            },
            function (html, text) {
                var mess = {
                    from: mailConfig.from,
                    to: data.to,
                    subject: data.subject,
                    text: text,
                    html: html,
                    attachments: data.attachments ? data.attachments : undefined
                };
                me.src.mailTransport.sendMail(mess, function (err,stateus) {
                    if (me.debug) {
                        err?console.log('Got error while sending email',err):console.log('',err);
                    }
                    cb(err)
                });
            }
        ].runEach();
    }
});