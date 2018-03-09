const { applyMiddleware, createStore } = require("redux");
const { createLogger } = require("redux-logger");
const thunk = require("redux-thunk").default;
const reducers = require("./reducers/index");

const IS_PRODUCTION = process.env.NODE_ENV === "production";

module.exports = () => {
  let middleware;

  if (IS_PRODUCTION) {
    middleware = applyMiddleware(thunk);
  } else {
    middleware = applyMiddleware(thunk, createLogger());
  }
  const store = createStore(reducers, middleware);

  return store;
};
