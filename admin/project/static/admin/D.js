Glob = {};
if (!window.TEXTS) {
  window.TEXTS = {};
  window.LOCALE = "en";
}

D = {
  t: function(t, val) {
    var tx;

    if (window.TEXTS && window.TEXTS[t]) tx = window.TEXTS[t];
    else if (window.LOCALE && window.LOCALE[t]) tx = window.LOCALE[t];
    else tx = t;
    if (val != null)
      for (var i = 0; i < val.length; i++) tx = tx.replace("%s", val[i]);
    return tx;
  },
  a: function(title, text, vals, susses) {
    Ext.Msg.alert(D.t(title), D.t(text, vals), function(btn) {
      if (susses != null) susses();
    });
  },
  c: function(title, text, vals, susses, error) {
    Ext.Msg.confirm(D.t(title), D.t(text, vals), function(btn) {
      if (btn == "yes" && !!susses) susses();
      if (btn != "yes" && !!error) error();
    });
  },
  w: function(t, v) {
    alert(D.t(t, v));
  },
  p: function(t, t1, v, susses) {
    Ext.MessageBox.prompt(
      D.t(t),
      D.t(t1),
      function(btn, text) {
        if (btn == "ok") {
          susses(text);
        }
      },
      null,
      null,
      v
    );
  },
  translit: function(s) {
    var lets = {
        "1072": "a",
        "1073": "b",
        "1074": "v",
        "1075": "g",
        "1076": "d",
        "1077": "e",
        "1105": "е",
        "1078": "j",
        "1079": "z",
        "1080": "i",
        "1081": "i",
        "1082": "k",
        "1083": "l",
        "1084": "m",
        "1085": "n",
        "1086": "o",
        "1087": "p",
        "1088": "r",
        "1089": "s",
        "1090": "t",
        "1091": "u",
        "1092": "f",
        "1093": "h",
        "1094": "tc",
        "1095": "ch",
        "1096": "sh",
        "1097": "sth",
        "1098": "",
        "1099": "i",
        "1100": "",
        "1101": "e",
        "1102": "yu",
        "1103": "ya"
      },
      os = "",
      c,
      cc;
    s = s.toLowerCase();
    for (var i = 0; i < s.length; i++) {
      c = s.charAt(i);
      cc = s.charCodeAt(i) + "";

      if (lets[cc]) os += lets[cc];
      else if (/[0-9\w\-]/.test(c)) os += c;
      else if (c == " ") os += "_";
    }
    return os;
  },

  translate: function(s, callback) {
    callback(D.translit(s));
    return;

    Ext.Ajax.request({
      url: [
        "https://translate.yandex.net/api/v1.5/tr.json/translate?",
        "key=trnsl.1.1.20130506T105223Z.fb8448be3498cdae.cc08a93c29a57ba3ea1a7a641e9af39821d017ae&",
        "lang=ru-en&",
        "text=" + s
      ].join(""),
      success: function(data) {
        data = Ext.decode(data.responseText);
        if (data && data.code && data.code == 200) {
          callback(D.translit(data.text[0]));
        } else callback(D.translit(s));
      }
    });
  }
};

Sess = {
  url: function(url, noslash) {
    var id = localStorage.getItem("uid") || 0,
      token = encodeURIComponent(localStorage.getItem("token")) || 0;

    if (url.charAt(0) == "/")
      return url + (noslash ? "" : "/") + "?id=" + id + "&token=" + token;

    return "/Admin." + url + "/?id=" + id + "&token=" + token;
  },
  userName: "",
  userIconCls: "user",
  loaded: {},
  makeGuid: function() {
    var s4 = function() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    };
    return (
      s4() +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      s4() +
      s4()
    );
  },
  states: {},
  getState: function(winId) {
    if (Sess.states && Sess.states[winId]) return Sess.states[winId];
    return null;
  },

  setState: function(winId, sets, cb) {
    if (!Sess.states || Ext.isArray(Sess.states)) Sess.states = {};
    if (!Sess.states[winId]) Sess.states[winId] = {};
    for (var i in sets) {
      Sess.states[winId][i] = sets[i];
    }
    Glob.Ajax.request({
      url: "User.setUserSets",
      jsonData: Sess.states,
      succ: cb
    });
  }
};
