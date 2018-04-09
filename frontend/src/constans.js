const DEFAULT_STATE = {
  UI: {
    sidebarOpen: true,
    exportMenuOpen: false,
    loaded: false,
    fullScreenMode: false,
    playerPanelVisible: true
  },
  DATE: {
    start: new Date("2018-01-01").getTime(),
    end: new Date("2018-02-01").getTime(),
    selected: new Date("2018-01-01").getTime(),
    interval: "days",
    isPlaying: false
  },
  MAP: {
    lat: 4.565487650256799,
    lng: -119.15495680771471,
    zoom: 0
  },
  META: {
    name: "",
    description: "",
    project: ""
  },
  STYLE: {
    background: "dark",
    features: [
      {
        name: "roads",
        enabled: true,
        baseEnabled: true,
        highlightEnabled: true,
        base: {
          "line-color": {
            r: 42,
            g: 147,
            b: 187,
            a: 0.7
          },
          "line-width": 1
        },
        highlight: {
          "line-color": {
            r: 255,
            g: 255,
            b: 255,
            a: 0.3
          },
          "line-width": 1
        }
      },
      {
        name: "buildings",
        enabled: true,
        baseEnabled: true,
        highlightEnabled: true,
        base: {
          "line-color": {
            r: 214,
            g: 85,
            b: 109,
            a: 0.3
          },
          "line-width": 1
        },
        highlight: {
          "line-color": {
            r: 255,
            g: 255,
            b: 255,
            a: 0.3
          },
          "line-width": 1
        }
      }
    ]
  }
};

module.exports = {
  CHANGE_INTERVAL: "CHANGE_INTERVAL",
  SET_DATES: "SET_DATES",
  SET_SELECTED_DATE: "SET_SELECTED_DATE",
  SET_COORDINATES: "SET_COORDINATES",
  TOGGLE_PLAY: "TOGGLE_PLAY",

  SET_MAP_BACKGROUND: "SET_MAP_BACKGROUND",
  SET_FEATURE_STYLE: "SET_FEATURE_STYLE",

  SHOW_EXPORT_MENU: "SHOW_EXPORT_MENU",
  HIDE_EXPORT_MENU: "HIDE_EXPORT_MENU",
  TOGGLE_SIDEBAR: "TOGGLE_SIDEBAR",
  TOGGLE_FULLSCREEN: "TOGGLE_FULLSCREEN",
  SHOW_PLAYER_PANEL: "SHOW_PLAYER_PANEL",
  HIDE_PLAYER_PANEL: "HIDE_PLAYER_PANEL",

  SET_METADATA: "SET_METADATA",

  EXPORT_DATA_FETCHING: "EXPORT_DATA_FETCHING",
  EXPORT_DATA_FETCHED: "EXPORT_DATA_FETCHED",
  EXPORT_DATA_SAVING: "EXPORT_DATA_SAVING",
  EXPORT_DATA_SAVED: "EXPORT_DATA_SAVED",
  SET_APP_READY: "SET_APP_READY",

  DEFAULT_STATE
};
