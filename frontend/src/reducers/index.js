const { combineReducers } = require("redux");
const { routerReducer } = require("react-router-redux");
const { createExportConfig } = require("../utils");

const meta = require("./meta");
const date = require("./date");
const map = require("./map");
const style = require("./style");
const ui = require("./ui");

const {
  EXPORT_DATA_FETCHED,
  EXPORT_DATA_SAVING,
  EXPORT_DATA_SAVED,
  DEFAULT_STATE,
  ROUTE_CHANGE
} = require("../constans");

const initialState = {
  orginal: createExportConfig({
    meta: DEFAULT_STATE.meta,
    date: DEFAULT_STATE.date,
    style: DEFAULT_STATE.style,
    map: DEFAULT_STATE.map
  }),
  saving: false
};

const data = (state = initialState, { type, payload }) => {
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

const rootReducer = (state = DEFAULT_STATE, action) => {
  if (action.type === ROUTE_CHANGE && action.payload.pathname === "/edit/") {
    return reducers(
      Object.assign({}, state, {
        map: DEFAULT_STATE.map,
        date: DEFAULT_STATE.date,
        meta: DEFAULT_STATE.meta,
        style: DEFAULT_STATE.style
      }),
      action
    );
  }
  return reducers(state, action);
};

module.exports = rootReducer;
