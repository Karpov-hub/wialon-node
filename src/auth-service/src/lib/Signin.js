import db from "@lib/db";
import crypto from "crypto";
import sha1 from "sha1";
import MemStore from "@lib/memstore";
import { equalsIgnoringCase, CONSTANTS } from "./Global";
import { log } from "@lib/log";
import { hashPassword } from "@lib/utils";

// blocking time with erroneous login, sec
const BlockTimeout = 180;

// number of password attempts
const CountOfErrorsInPassword = 3;

async function signin(data, realm) {
  const res = await db.user.findOne({
    where: { email: data.login, realm, removed: 0 },
    attributes: [
      "id",
      "pass",
      "is_active",
      "userlevel",
      "is_blocked_by_admin",
      "salt"
    ],
    raw: true
  });
  try {
    let userlevel = 0; //by default web

    if (
      data.usertype &&
      equalsIgnoringCase(data.usertype, CONSTANTS.USER_TYPE_MOBILE)
    ) {
      userlevel = 1;
    }

    if (await checkLoginBlocked(data.login, realm)) throw "LOGINBLOCKED";

    if (res) {
      if (res.is_blocked_by_admin) throw "USERHASBENNBLOCKEDBYADMIN";
      //@Vaibhav Mali @Date:14 Jan 2020...Handled condition for whether the account is active or not.
      if (!res.is_active && !data.is_test) {
        throw "NOTACTIVATEDACCOUNT";
      } else {
        if (res.salt && res.pass == hashPassword(data.pass, res.salt)) {
          if (userlevel == res.userlevel || res.userlevel == 2) {
            const token = crypto.randomBytes(42).toString("hex");
            await MemStore.set("usr" + token, res.id, 1200); //1200second i.e. 20min
            let allUsers = (await MemStore.get("users"))
              ? await MemStore.get("users")
              : "";
            if (allUsers && allUsers.length > 0) {
              allUsers += ";" + res.id + ":" + token;
            } else allUsers = res.id + ":" + token;
            await MemStore.set("users", allUsers);
            log("Successfully logged in", arguments, {
              profile: res.id
            });
            return { success: true, token };
          } else {
            throw "ACCESSDENIED";
          }
        } else if (!res.salt && res.pass == sha1(data.pass)) {
          throw "PASSWORDSAVEDBYOLDALGORITHM";
        }
        await loginBlock(data.login, realm);
      }
    }
    throw "LOGINERROR";
  } catch (e) {
    log("Failed to log in", arguments, {
      level: "error",
      profile: res ? res.id : null,
      details: {
        stack: e.stack || e.message || e
      }
    });
    throw e;
  }
}

async function checkLoginBlocked(login, realm) {
  const key = "blk" + sha1(login + "-" + realm);
  let count = await MemStore.get(key);
  if (count && parseInt(count) >= CountOfErrorsInPassword) return true;
  return false;
}

async function loginBlock(login, realm) {
  const key = "blk" + sha1(login + "-" + realm);
  let count = await MemStore.get(key);
  if (count) count = parseInt(count);
  else count = 0;
  await MemStore.set(key, count + 1, BlockTimeout);
}

async function signout(data, realm, userId) {
  let getIdOfToken = await MemStore.get("usr" + data.token);
  let valueForDelete = getIdOfToken + ":" + data.token;
  await MemStore.del("usr" + data.token);
  let allUsersToChange = await MemStore.get("users");
  let allUsersToChangeArray = allUsersToChange.split(";");
  let indexForDel = allUsersToChangeArray.indexOf(valueForDelete);
  if (indexForDel > -1) {
    allUsersToChangeArray.splice(indexForDel, 1);
    let changedArray = allUsersToChangeArray.toString();
    await MemStore.set("users", changedArray);
  }
  return { success: true };
}

export default {
  signin,
  signout
};
