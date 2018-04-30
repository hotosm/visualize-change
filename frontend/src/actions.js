const moment = require("moment");
const { push } = require("react-router-redux");
const { createExportConfig } = require("./utils");

const {
  CHANGE_INTERVAL,
  SET_SPEED,
  SET_DATES,
  SET_SELECTED_DATE,
  SET_COORDINATES,
  TOGGLE_PLAY,
  SET_MAP_BACKGROUND,
  SET_FEATURE_STYLE,
  SET_TUTORIAL_MODE_ON,
  SET_TUTORIAL_MODE_OFF,
  SHOW_POPOVER,
  HIDE_POPOVER,
  NEXT_TUTORIAL_SLIDE,
  CHANGE_SIDEBAR_TAB,
  SHOW_EXPORT_MENU,
  HIDE_EXPORT_MENU,
  TOGGLE_SIDEBAR,
  TOGGLE_FULLSCREEN,
  SHOW_PLAYER_PANEL,
  HIDE_PLAYER_PANEL,
  SET_METADATA,
  EXPORT_RENDER_QUEUED,
  EXPORT_DATA_FETCHING,
  EXPORT_DATA_FETCHED,
  EXPORT_DATA_SAVING,
  EXPORT_DATA_SAVED,
  SET_APP_READY,
  MAP_LOADING,
  MAP_LOADED
} = require("./constans/index");

// inspired by Flux Standard Action
const action = (type, payload) => {
  if (typeof payload === "undefined") {
    return { type };
  }
  return { type, payload };
};

const sendToRenderer = ({ email, format, size }) => (dispatch, getState) => {
  const { map, date, style } = getState();

  const mapConfig = Object.assign({}, map, {
    startDate: date.start,
    endDate: date.end,
    interval: date.interval,
    speed: date.speed,
    email,
    format,
    size,
    style: style
  });

  fetch("/api/queue-render", {
    headers: {
      "Content-Type": "application/json"
    },
    method: "post",
    body: JSON.stringify(mapConfig)
  })
    .then(res => {
      if (res.ok) {
        dispatch(action(EXPORT_RENDER_QUEUED));
      }
    })
    .catch(err => console.log("err", err));
};

const exportDataFetching = data => action(EXPORT_DATA_FETCHING, data);
const exportDataFetched = data => action(EXPORT_DATA_FETCHED, data);
const exportDataSaving = () => action(EXPORT_DATA_SAVING);
const exportDataSaved = () => action(EXPORT_DATA_SAVED);

const createNewExport = parentId => (dispatch, getState) => {
  const config = createExportConfig(getState());

  dispatch(exportDataSaving());

  fetch("/api/exports", {
    headers: {
      "Content-Type": "application/json",
      credentials: "include"
    },
    method: "POST",
    body: JSON.stringify({ parentId, config: config })
  })
    .then(res => res.json())
    .then(id => {
      dispatch(push(`/edit/${id}`));
      dispatch(exportDataSaved());
    });
};

const setAppReady = () => action(SET_APP_READY);

const getExportById = id => dispatch => {
  dispatch(exportDataFetching);
  fetch(`/api/exports/${id}`, {
    headers: {
      "Content-Type": "application/json",
      credentials: "include"
    },
    method: "GET"
  })
    .then(res => {
      return res.json();
    })
    .then(data => {
      if (data.length > 0) {
        dispatch(exportDataFetched({ config: data[0].config }));
      } else {
        dispatch(push(`/edit/`));
        dispatch(setAppReady);
      }
    });
};

module.exports = {
  setInterval: interval => action(CHANGE_INTERVAL, interval),
  setSpeed: speed => action(SET_SPEED, speed),
  setDateSpan: ([start, end]) =>
    action(SET_DATES, { start: moment(start).valueOf(), end: end ? moment(end).valueOf() : null }),
  setSelectedDate: date => action(SET_SELECTED_DATE, date),
  setCoordinates: coordinates => action(SET_COORDINATES, coordinates),
  togglePlay: () => action(TOGGLE_PLAY),

  setMapBackground: background => action(SET_MAP_BACKGROUND, background),
  setFeatureStyle: (selectedIndex, newStyle) => action(SET_FEATURE_STYLE, { selectedIndex, newStyle }),

  changeSidebarTab: id => action(CHANGE_SIDEBAR_TAB, id),
  setTutorialModeOn: () => action(SET_TUTORIAL_MODE_ON),
  setTutorialModeOff: () => action(SET_TUTORIAL_MODE_OFF),
  showPopover: id => action(SHOW_POPOVER, id),
  hidePopover: id => action(HIDE_POPOVER, id),
  goToNextInTutorial: currentId => action(NEXT_TUTORIAL_SLIDE, currentId),
  showExportMenu: () => action(SHOW_EXPORT_MENU),
  hideExportMenu: () => action(HIDE_EXPORT_MENU),
  toggleSidebar: () => action(TOGGLE_SIDEBAR),
  toggleFullscreen: () => action(TOGGLE_FULLSCREEN),
  showPlayerPanel: () => action(SHOW_PLAYER_PANEL),
  hidePlayerPanel: () => action(HIDE_PLAYER_PANEL),
  setMapLoading: () => action(MAP_LOADING),
  setMapLoaded: () => action(MAP_LOADED),
  goTo: url => dispatch => dispatch(push(url)),

  setMetadata: (name, value) => action(SET_METADATA, { name, value }),

  sendToRenderer,
  getExportById,
  createNewExport,
  setAppReady
};
