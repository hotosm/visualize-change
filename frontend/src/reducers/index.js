const { combineReducers } = require("redux");

const date = require("./date");
const map = require("./map");
const style = require("./style");
const ui = require("./ui");

const reducers = combineReducers({ date, map, style, ui });

module.exports = reducers;
