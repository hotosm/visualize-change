// TODO: Move this to JSON that HOT can configure

const FEATURES_1 = [
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
];

const FEATURES_2 = [
  {
    name: "roads",
    enabled: true,
    baseEnabled: true,
    highlightEnabled: true,
    base: {
      "line-color": {
        r: 80,
        g: 227,
        b: 194,
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
        r: 248,
        g: 173,
        b: 28,
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
];

const FEATURES_STYLES = {
  1: FEATURES_1,
  2: FEATURES_2
};

const INTERVAL_VALUES = ["hours", "days", "weeks", "months", "years"];

const DEFAULT_STATE = {
  ui: {
    sidebarOpen: true,
    exportMenuOpen: false,
    exportMenuStatus: null,
    fullScreenMode: false,
    playerPanelVisible: true,
    visiblePopoversIds: [],
    tutorialMode: false,
    selectedSidebarTabId: "basicEdit",
    mapLoaded: true
  },
  date: {
    start: new Date().setHours(12, 0, 0, 0) - 604800000,
    end: new Date().setHours(12, 0, 0, 0),
    selected: new Date().setHours(12, 0, 0, 0) - 604800000,
    interval: INTERVAL_VALUES[1],
    isPlaying: false,
    speed: 1
  },
  map: {
    lat: 0,
    lng: 0,
    zoom: 1
  },
  meta: {
    name: "",
    description: "",
    project: ""
  },
  style: {
    background: "light",
    features: FEATURES_STYLES[1]
  }
};

module.exports = {
  DEFAULT_DATE_FORMAT: "YYYY-MM-DD",
  INTERVAL_VALUES,

  CHANGE_INTERVAL: "CHANGE_INTERVAL",
  SET_SPEED: "SET_SPEED",
  SET_DATES: "SET_DATES",
  SET_SELECTED_DATE: "SET_SELECTED_DATE",
  SET_COORDINATES: "SET_COORDINATES",
  TOGGLE_PLAY: "TOGGLE_PLAY",

  SET_MAP_BACKGROUND: "SET_MAP_BACKGROUND",
  SET_FEATURE_STYLE: "SET_FEATURE_STYLE",

  CHANGE_SIDEBAR_TAB: "CHANGE_SIDEBAR_TAB",
  SHOW_EXPORT_MENU: "SHOW_EXPORT_MENU",
  HIDE_EXPORT_MENU: "HIDE_EXPORT_MENU",
  TOGGLE_SIDEBAR: "TOGGLE_SIDEBAR",
  TOGGLE_FULLSCREEN: "TOGGLE_FULLSCREEN",
  SHOW_PLAYER_PANEL: "SHOW_PLAYER_PANEL",
  HIDE_PLAYER_PANEL: "HIDE_PLAYER_PANEL",
  SHOW_POPOVER: "SHOW_POPOVER",
  HIDE_POPOVER: "HIDE_POPOVER",
  NEXT_TUTORIAL_SLIDE: "NEXT_TUTORIAL_SLIDE",
  SET_TUTORIAL_MODE_ON: "TUTORIAL_MODE_ON",
  SET_TUTORIAL_MODE_OFF: "TUTORIAL_MODE_OFF",

  SET_METADATA: "SET_METADATA",

  //SET_DEFAULT_STATE: "SET_DEFAULT_STATE",

  ROUTE_CHANGE: "@@router/LOCATION_CHANGE",

  EXPORT_RENDER_QUEUED: "EXPORT_RENDER_QUEUED",
  EXPORT_DATA_FETCHING: "EXPORT_DATA_FETCHING",
  EXPORT_DATA_FETCHED: "EXPORT_DATA_FETCHED",
  EXPORT_DATA_SAVING: "EXPORT_DATA_SAVING",
  EXPORT_DATA_SAVED: "EXPORT_DATA_SAVED",

  MAP_LOADING: "MAP_LOADING",
  MAP_LOADED: "MAP_LOADED",

  SET_APP_READY: "SET_APP_READY",

  HELP_SLIDE_ORDER: ["bottombar-help", "basic-tab-help", "describe-help", "dates-help", "styles-help"],

  DEFAULT_STATE,
  FEATURES_STYLES
};
