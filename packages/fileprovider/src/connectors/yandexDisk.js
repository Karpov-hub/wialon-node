import config from "@lib/config";
import watermark from "image-watermark";
import fs from "fs";

const YandexDisk = require("yandex-disk").YandexDisk;
const disk = new YandexDisk("jmihvalera1357", "369258147WASD");

function push(file) {
  return new Promise((resolve, reject) => {
    disk.writeFile(`/${file.code}`, file.data, null, err => {
      if (err) reject(err);
      resolve({ success: true });
    });
  });
}

function pull(code) {
  return new Promise((resolve, reject) => {
    disk.readFile(`${code}`, null, (err, content) => {
      if (err) reject(err);
      resolve(content);
    });
  });
}

function exists(code) {
  return new Promise((resolve, reject) => {
    disk.exists(`/${code}`, (err, exists) => {
      if (err) reject(err);
      resolve({ success: exists });
    });
  });
}

function del(code) {
  return new Promise((resolve, reject) => {
    disk.remove(`/${code}`, err => {
      if (err) reject(err);
      disk.exists(`/${code}`, (err, exists) => {
        resolve(!exists);
      });
    });
  });
}

function watermarkFile(code) {
  var options = {
    text: "DO NOT FOR COPY",
    resize: "200%",
    dstPath: `${config.upload_dir}/${code}`,
    align: "dia1",
    color: "rgba(0,0,0,0.1)"
  };

  // const downloadFile = new Promise((resolve, reject) => {
  //   disk.downloadFile(`${code}`, `${config.upload_dir}/${code}`, err => {
  //     if (err) reject(err);
  //   });
  //   resolve();
  // });

  // const watermarkFile = function() {
  //   watermark.embedWatermarkWithCb(
  //     `${config.upload_dir}/${code}`,
  //     options,
  //     err => {
  //       if (err) return Promise.reject(err);
  //       options.align = "dia2";
  //       watermark.embedWatermarkWithCb(
  //         `${config.upload_dir}/${code}`,
  //         options,
  //         err => {
  //           if (err) return Promise.reject(err);
  //           return Promise.resolve();
  //         }
  //       );
  //     }
  //   );
  // };

  // const uploadFile = function() {
  //   disk.uploadFile(`${config.upload_dir}/${code}`, `${code}`, err => {
  //     if (err) return Promise.reject(err);
  //     Promise.resolve();
  //   });
  // };

  // const unlinkFile = function() {
  //   fs.unlink(`${config.upload_dir}/${code}`, err => {
  //     if (err) return Promise.reject(err);
  //     Promise.resolve({ success: true, code: code });
  //   });
  // };

  // return downloadFile
  //   .then(watermarkFile)
  //   .then(uploadFile)
  //   .then(unlinkFile)
  //   .catch(error => {
  //     throw error;
  //   });

  return new Promise((resolve, reject) => {
    disk.downloadFile(`${code}`, `${config.upload_dir}/${code}`, err => {
      if (err) reject(err);
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
              disk.uploadFile(
                `${config.upload_dir}/${code}`,
                `${code}`,
                err => {
                  fs.unlink(`${config.upload_dir}/${code}`, (err, res) => {
                    if (err) reject(err);
                    resolve({ success: true, code: code });
                  });
                }
              );
            }
          );
        }
      );
    });
  });
}

export default {
  push,
  pull,
  exists,
  del,
  watermarkFile
};
