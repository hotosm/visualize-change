const { combineReducers } = require("redux");

const date = require("./date");
const map = require("./map");
const ui = require("./ui");

const reducers = combineReducers({ date, map, ui });

module.exports = reducers;
