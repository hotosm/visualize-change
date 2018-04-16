const { applyMiddleware, createStore } = require("redux");
const { createLogger } = require("redux-logger");
const thunk = require("redux-thunk").default;

const { routerMiddleware } = require("react-router-redux");

const reducers = require("./reducers/index");

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const IS_NO_LOGGER = document.location.search.indexOf("no-logger") >= 0;

module.exports = ({ history }) => {
  let middleware;

  if (IS_PRODUCTION || IS_NO_LOGGER) {
    middleware = applyMiddleware(thunk, routerMiddleware(history));
  } else {
    middleware = applyMiddleware(thunk, createLogger(), routerMiddleware(history));
  }
  const store = createStore(reducers, middleware);

  return store;
};
