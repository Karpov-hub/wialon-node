import { CONSTANTS } from "@lib/utils";
import { equalsIgnoringCase } from "@lib/utils"

function uniqueArray(a) {
  return Array.from(new Set(a));
}

function isArray(obj) {
  return !!obj && obj.constructor === Array;
}

export { CONSTANTS, equalsIgnoringCase, uniqueArray, isArray };
