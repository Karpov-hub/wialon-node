import { Base, Types } from "../datasources/Pg";

let model = Base.define("permissions", {
  _id: {
    type: Types.UUID,
    primaryKey: true
  },
  pid: {
    type: Types.UUID
  },
  servicename: {
    type: Types.STRING
  },
  methods: {
    type: Types.ARRAY(Types.STRING)
  }
});

//model.sync({force:true}).then(() => {});

export default model;
