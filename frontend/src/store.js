const { applyMiddleware, createStore } = require("redux");
const { createLogger } = require("redux-logger");
const thunk = require("redux-thunk").default;

const { routerMiddleware } = require("react-router-redux");

const reducers = require("./reducers/index");

const IS_PRODUCTION = process.env.NODE_ENV === "production";

module.exports = ({ history }) => {
  let middleware;

  if (IS_PRODUCTION) {
    middleware = applyMiddleware(thunk, routerMiddleware(history));
  } else {
    middleware = applyMiddleware(thunk, createLogger(), routerMiddleware(history));
  }
  const store = createStore(reducers, middleware);

  return store;
};
