const moment = require("moment");
const {
  CHANGE_INTERVAL,
  SET_DATES,
  SET_SELECTED_DATE,
  SET_COORDINATES,
  TOGGLE_PLAY,
  SHOW_EXPORT_MENU,
  HIDE_EXPORT_MENU,
  TOGGLE_SIDEBAR
} = require("./constans");

// inspired by Flux Standard Action
const action = (type, payload) => {
  if (typeof payload === "undefined") {
    return { type };
  }
  return { type, payload };
};

module.exports = {
  setInterval: interval => action(CHANGE_INTERVAL, interval),
  setDateSpan: ([start, end]) => action(SET_DATES, { start: moment(start).valueOf(), end: moment(end).valueOf() }),
  setSelectedDate: date => action(SET_SELECTED_DATE, date),
  setCoordinates: coordinates => action(SET_COORDINATES, coordinates),
  togglePlay: () => action(TOGGLE_PLAY),

  showExportMenu: () => action(SHOW_EXPORT_MENU),
  hideExportMenu: () => action(HIDE_EXPORT_MENU),
  toggleSidebar: () => action(TOGGLE_SIDEBAR)
};
