const moment = require("moment");
const { push } = require("react-router-redux");

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
  TOGGLE_SIDEBAR,
  SET_METADATA,
  EXPORT_DATA_FETCHED
} = require("./constans");

// inspired by Flux Standard Action
const action = (type, payload) => {
  if (typeof payload === "undefined") {
    return { type };
  }
  return { type, payload };
};

const createExportConfig = state => ({
  meta: state.meta,
  startDate: state.date.start,
  endDate: state.date.end,
  interval: state.date.interval,
  style: state.style,
  map: state.map
});

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

const createNewExport = () => (dispatch, getState) => {
  const config = createExportConfig(getState());

  fetch("/api/exports", {
    headers: {
      "Content-Type": "application/json",
      credentials: "include"
    },
    method: "POST",
    body: JSON.stringify(config)
  })
    .then(res => res.json())
    .then(id => {
      dispatch(push(`/edit/${id}`));
    });
};

const exportDataFetched = data => action(EXPORT_DATA_FETCHED, data);

const getExportById = id => dispatch => {
  fetch(`/api/exports/${id}`, {
    headers: {
      "Content-Type": "application/json",
      credentials: "include"
    },
    method: "GET"
  })
    .then(res => res.json())
    .then(data => {
      console.log("data", data);
      if (data.length > 0) {
        dispatch(exportDataFetched({ data: data[0] }));
      }
    });
};

const updateExport = id => (dispatch, getState) => {
  const config = createExportConfig(getState());

  fetch(`/api/exports/${id}`, {
    headers: {
      "Content-Type": "application/json",
      credentials: "include"
    },
    method: "PATCH",
    body: JSON.stringify(config)
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

  setMetadata: (name, value) => action(SET_METADATA, { name, value }),

  sendToRenderer,
  getExportById,
  createNewExport,
  updateExport
};
