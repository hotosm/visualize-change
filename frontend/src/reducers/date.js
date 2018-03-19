const clamp = require("lodash.clamp");
const { CHANGE_INTERVAL, SET_DATES, SET_SELECTED_DATE, TOGGLE_PLAY, EXPORT_DATA_FETCHED } = require("../constans");

const initialState = {
  start: new Date("2018-01-01").getTime(),
  end: new Date("2018-02-01").getTime(),
  selected: new Date("2018-01-01").getTime(),
  interval: "days",
  isPlaying: false
};

module.exports = (state = initialState, { type, payload }) => {
  switch (type) {
    case EXPORT_DATA_FETCHED:
      return Object.assign({}, initialState, {
        start: payload.data.config.startDate,
        end: payload.data.config.endDate,
        selected: payload.data.config.startDate,
        interval: payload.data.config.interval
      });
    case CHANGE_INTERVAL:
      return Object.assign({}, state, { interval: payload });
      break;
    case SET_DATES:
      return Object.assign({}, state, { start: payload.start, end: payload.end, selected: payload.start });
      break;
    case SET_SELECTED_DATE:
      return Object.assign({}, state, {
        selected: clamp(payload, state.start, state.end),
        isPlaying: state.isPlaying && payload < state.end
      });
      break;
    case TOGGLE_PLAY:
      return Object.assign({}, state, {
        isPlaying: !state.isPlaying,
        selected: state.selected >= state.end ? state.start : state.selected
      });
      break;
    default:
      return state;
  }
};
