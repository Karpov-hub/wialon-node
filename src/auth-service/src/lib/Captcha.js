import svgCaptcha from "svg-captcha";
import MemStore from "@lib/memstore";

async function getCaptcha(data) {
  if (!data || !data.token || !/^[a-z0-9\-]{32,}$/.test(data.token))
    throw "INVALIDDATA";
  let options;
  if (data.background) {
    options = {
      background: data.background,
      color: true
    };
  }
  const captcha = svgCaptcha.create(options);
  await MemStore.set("cpt" + data.token, captcha.text, 300);
  return { data: captcha.data };
}

async function checkCaptcha(data) {
  if (!data.token || !data.captcha) return false;
  const key = "cpt" + data.token;
  const captchaText = await MemStore.get(key);
  if (captchaText == data.captcha) {
    return true;
  }
  return false;
}

export default {
  checkCaptcha,
  getCaptcha
};
