import { Validator } from "jsonschema";

Validator.prototype.customFormats.uuid = function(input) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    input
  );
};

const schemaValidator = new Validator();

export default {
  schemaValidator
};
