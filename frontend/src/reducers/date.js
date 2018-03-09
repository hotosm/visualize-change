const { CHANGE_INTERVAL, SET_DATES, SET_SELECTED_DATE, TOGGLE_PLAY } = require("../constans");

const initialState = {
  start: new Date("2018-01-01"),
  end: new Date("2018-02-01"),
  selected: new Date("2018-01-01"),
  interval: "days",
  isPlaying: false
};

module.exports = (state = initialState, { type, payload }) => {
  switch (type) {
    case CHANGE_INTERVAL:
      return Object.assign({}, state, { interval: payload });
      break;
    case SET_DATES:
      return Object.assign({}, state, { start: payload.start, end: payload.end });
      break;
    case SET_SELECTED_DATE:
      return Object.assign({}, state, { selected: payload });
      break;
    case TOGGLE_PLAY:
      return Object.assign({}, state, { isPlaying: !state.isPlaying });
      break;
    default:
      return state;
  }
};
