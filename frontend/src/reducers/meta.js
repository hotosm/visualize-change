const { EXPORT_DATA_FETCHED, SET_METADATA } = require("../constans");

const initialState = {
  name: "",
  description: "",
  project: ""
};

module.exports = (state = initialState, { type, payload }) => {
  switch (type) {
    case EXPORT_DATA_FETCHED:
      return Object.assign({}, initialState, {
        name: payload.data.config.meta.name,
        description: payload.data.config.meta.description,
        project: payload.data.config.meta.project
      });
    case SET_METADATA:
      return Object.assign({}, state, { [payload.name]: payload.value });
      break;
    default:
      return state;
  }
};
