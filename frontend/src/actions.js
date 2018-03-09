const { CHANGE_INTERVAL, SET_DATES, SET_SELECTED_DATE, SET_COORDINATES, TOGGLE_PLAY } = require("./constans");

// inspired by Flux Standard Action
const action = (type, payload) => {
  if (typeof payload === "undefined") {
    return { type };
  }
  return { type, payload };
};

module.exports = {
  setInterval: interval => action(CHANGE_INTERVAL, interval),
  setDateSpan: ([start, end]) => action(SET_DATES, { start, end }),
  setSelectedDate: date => action(SET_SELECTED_DATE, date),
  setCoordinates: coordinates => action(SET_COORDINATES, coordinates),
  togglePlay: () => action(TOGGLE_PLAY)
};
