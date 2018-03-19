const { combineReducers } = require("redux");
const { routerReducer } = require("react-router-redux");

const meta = require("./meta");
const date = require("./date");
const map = require("./map");
const style = require("./style");
const ui = require("./ui");

const { EXPORT_DATA_FETCHED, EXPORT_DATA_SAVING, EXPORT_DATA_SAVED } = require("../constans");

const data = (state = { orginal: null, saving: false }, { type, payload }) => {
  switch (type) {
    case EXPORT_DATA_SAVING:
      return Object.assign({}, state, { saving: true });
      break;
    case EXPORT_DATA_SAVED:
      return Object.assign({}, state, { saving: false });
      break;
    case EXPORT_DATA_FETCHED:
      return Object.assign({}, state, { orginal: payload.config });
      break;
    default:
      return state;
  }
};

const reducers = combineReducers({ meta, date, map, style, ui, data, router: routerReducer });

module.exports = reducers;
