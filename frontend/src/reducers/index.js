const { combineReducers } = require("redux");
const { routerReducer } = require("react-router-redux");

const meta = require("./meta");
const date = require("./date");
const map = require("./map");
const style = require("./style");
const ui = require("./ui");

const reducers = combineReducers({ meta, date, map, style, ui, router: routerReducer });

module.exports = reducers;
