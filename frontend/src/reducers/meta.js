const { EXPORT_DATA_FETCHED, SET_METADATA, DEFAULT_STATE } = require("../constans/index");

const initialState = DEFAULT_STATE.meta;

module.exports = (state = initialState, { type, payload }) => {
  switch (type) {
    case EXPORT_DATA_FETCHED:
      return Object.assign({}, initialState, {
        name: payload.config.meta.name,
        description: payload.config.meta.description,
        project: payload.config.meta.project
      });
    case SET_METADATA:
      return Object.assign({}, state, { [payload.name]: payload.value });
      break;
    default:
      return state;
  }
};
