const moment = require("moment");

const {
  CHANGE_INTERVAL,
  SET_DATES,
  SET_SELECTED_DATE,
  SET_COORDINATES,
  TOGGLE_PLAY,
  SET_MAP_BACKGROUND,
  SET_FEATURE_STYLE,
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

const sendToRenderer = ({ email, format, fps }) => (dispatch, getState) => {
  const { map, date, style } = getState();

  const mapConfig = Object.assign({}, map, {
    startDate: date.start,
    endDate: date.end,
    interval: date.interval,
    email,
    fps,
    format,
    style: style
  });

  fetch("/api/queue-render", {
    headers: {
      "Content-Type": "application/json"
    },
    method: "post",
    body: JSON.stringify(mapConfig)
  }).then(res => console.log(res));
};

module.exports = {
  setInterval: interval => action(CHANGE_INTERVAL, interval),
  setDateSpan: ([start, end]) => action(SET_DATES, { start: moment(start).valueOf(), end: moment(end).valueOf() }),
  setSelectedDate: date => action(SET_SELECTED_DATE, date),
  setCoordinates: coordinates => action(SET_COORDINATES, coordinates),
  togglePlay: () => action(TOGGLE_PLAY),

  setMapBackground: background => action(SET_MAP_BACKGROUND, background),
  setFeatureStyle: (selectedIndex, newStyle) => action(SET_FEATURE_STYLE, { selectedIndex, newStyle }),

  showExportMenu: () => action(SHOW_EXPORT_MENU),
  hideExportMenu: () => action(HIDE_EXPORT_MENU),
  toggleSidebar: () => action(TOGGLE_SIDEBAR),

  sendToRenderer
};
