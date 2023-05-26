import fs from "fs";
import watermark from "image-watermark";
import config from "@lib/config";

function push(file) {
  return new Promise((resolve, reject) => {
    fs.writeFile(`${config.upload_dir}/${file.code}`, file.data, (err, res) => {
      if (err) reject(err);
      else resolve({ success: true });
    });
  });
}

function pull(code) {
  return new Promise((resolve, reject) => {
    fs.readFile(`${config.upload_dir}/${code}`, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
}

function exists(code) {
  return new Promise((resolve, reject) => {
    fs.readFile(`${config.upload_dir}/${code}`, "utf8", (err, res) => {
      if (err) reject(err);
      else resolve(true);
    });
  });
}

function del(filename) {
  return new Promise((resolve, reject) => {
    fs.unlink(`${config.upload_dir}/${filename}`, (err, res) => {
      if (err) reject(err);
      else resolve(true);
    });
  });
}

async function watermarkFile(code) {
  var options = {
    text: "DO NOT FOR COPY",
    resize: "200%",
    dstPath: `${config.upload_dir}/${code}`,
    align: "dia1",
    color: "rgba(0,0,0,0.1)"
  };
  return new Promise((resolve, reject) => {
    watermark.embedWatermarkWithCb(
      `${config.upload_dir}/${code}`,
      options,
      err => {
        if (err) reject(err);
        options.align = "dia2";
        watermark.embedWatermarkWithCb(
          `${config.upload_dir}/${code}`,
          options,
          err => {
            if (err) reject(err);
            resolve({ success: true, code: code });
          }
        );
      }
    );
  });
}

export default {
  push,
  pull,
  exists,
  del,
  watermarkFile
};
