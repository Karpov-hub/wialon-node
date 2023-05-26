import express from "express";
import FileProvider from "@lib/fileprovider";
import bodyParser from "body-parser";
import cors from "cors";
import MemStore from "@lib/memstore";
import db from "@lib/db";
import config from "@lib/config";
import path from "path";
import fs from "fs";
import { capture } from "@lib/log";
capture();

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: "8mb" }));
app.use(
  bodyParser.urlencoded({ limit: "8mb", extended: true, parameterLimit: 8000 })
);

app.get("/download_report/:code", async (req, res) => {
  downloadReportFile(req, res);
});

app.get("/download/:code/:userToken", async (req, res) => {
  downloadFile(req, res, "USER");
});

app.get("/download/:code/:downloadHash/admin_download", async (req, res) => {
  downloadFile(req, res, "ADMIN");
});

app.get(
  "/download/fuc-report/:code/:usertoken/:filename?",
  async (req, res) => {
    await responseFile(
      config.upload_dir,
      `${req.params.code}.xlsx`,
      req.params.filename,
      res,
      req
    );
  }
);

async function downloadFile(req, res, type) {
  if (
    !req ||
    !req.params ||
    (!req.params.userToken && !req.params.downloadHash)
  )
    return res.send({ error: "INVALIDDATA" });
  if (type == "USER") {
    const userId = await checkUserPermissions(req.params.userToken);

    if (!userId) return res.send({ error: "ACCESSDENIEDFORUSER" });
  } else if (type == "ADMIN") {
    const userId = await checkAdmin(req.params.downloadHash);
    if (!userId.success) return res.send({ error: "ACCESSDENIEDFORUSER" });
  }

  // console.log('downloadFile: req = ', req)
  let fileBase64 = await FileProvider.pull(req.params);

  let response = {};
  let beginTypeIndex = fileBase64.data.indexOf(":") + 1;
  let endTypeIndex = fileBase64.data.indexOf(";");
  let indexBase64 = fileBase64.data.indexOf(",") + 1;

  response.type = fileBase64.data.slice(beginTypeIndex, endTypeIndex);
  response.data = fileBase64.data.substr(indexBase64);

  let binary = Buffer.from(response.data, "base64");

  res
    .set(
      "Content-Disposition",
      `attachment; filename=${encodeURI(fileBase64.name)}`
    )
    .send(binary);
}

async function checkUserPermissions(userToken) {
  const userId = await MemStore.get(`usr${userToken}`);
  if (userId) {
    await MemStore.set(`usr${userToken}`, userId, 1200);
  }
  return userId;
}

async function checkAdmin(hash) {
  const secret_key = process.env.SECRET_KEY;

  const ids = await db.admin_user.findAll({ attributes: ["_id"], raw: true });

  for (const admin of ids) {
    if ((await createHash(secret_key + admin._id)) == hash) {
      return { success: true };
    }
  }
  return { success: false, error: "ACCESSDENIEDED" };
}

async function createHash(stringData) {
  //Loading the crypto module in node.js
  const crypto = require("crypto");
  //creating hash object
  let hash = crypto.createHash("sha1");
  //passing the data to be hashed
  let data = hash.update(stringData, "utf8");
  //Creating the hash in the required format
  let gen_hash = data.digest("hex");
  return gen_hash;
}

async function downloadReportFile(req, res) {
  const fileName = req.params.code; // $_GET["id"]
  const filePath = "../../../upload/";

  res.setHeader("Content-Disposition", "attachment; filename=report.xlsx");
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  await res.download(
    filePath + fileName,
    "report" + new Date().getTime() + ".xlsx"
  );
}

async function responseFile(basePath, code, fileName, res, req) {
  const fullFileName = path.join(basePath, code);

  const userId = await checkUserPermissions(req.params.usertoken);

  if (!userId) return res.send({ error: "ACCESSDENIEDFORUSER" });
  return new Promise((resolve) => {
    fs.exists(fullFileName, function(exist) {
      if (exist) {
        const converDate = (partDate) => partDate.toString().padStart(2, "0");
        let defaultName = new Date();
        defaultName =
          `${converDate(defaultName.getFullYear())}-${converDate(
            defaultName.getMonth() + 1
          )}-` +
          `${converDate(defaultName.getDate())}_${converDate(
            defaultName.getHours()
          )}-${converDate(defaultName.getMinutes())}.xlsx`;
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${encodeURI(
            fileName ? fileName + ".xlsx" : defaultName
          )}`
        );
        res.setHeader("Content-Transfer-Encoding", "binary");
        res.setHeader("Content-Type", "application/octet-stream");
        resolve(res.sendFile(fullFileName));
        setTimeout(() => {
          try {
            fs.unlinkSync(fullFileName);
          } catch (e) {
            console.log(
              "File with fullFileName like:" +
                fullFileName +
                " was already deleted early!"
            );
          }
        }, 60000);
      } else {
        resolve(res.sendStatus(404));
      }
    });
  });
}

// if (
//   !process.env.NODE_ENV ||
//   !["test", "localtest"].includes(process.env.NODE_ENV)
// ) {
const server = app.listen(8012, () => {
  console.log("File-gate is running at %s", server.address().port);
});
//}

export default app;
