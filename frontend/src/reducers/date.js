const clamp = require("lodash.clamp");
const {
  CHANGE_INTERVAL,
  SET_SPEED,
  SET_DATES,
  SET_SELECTED_DATE,
  TOGGLE_PLAY,
  EXPORT_DATA_FETCHED,
  DEFAULT_STATE
} = require("../constans");

module.exports = (state = DEFAULT_STATE.date, { type, payload }) => {
  switch (type) {
    case EXPORT_DATA_FETCHED:
      return Object.assign({}, state, {
        start: payload.config.date.start,
        end: payload.config.date.end,
        selected: payload.config.date.start,
        interval: payload.config.date.interval,
        speed: payload.config.date.speed
      });
    case CHANGE_INTERVAL:
      return Object.assign({}, state, { interval: payload });
      break;
    case SET_SPEED:
      return Object.assign({}, state, {
        speed: payload
      });
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
