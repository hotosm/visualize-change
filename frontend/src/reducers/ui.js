const {
  SHOW_EXPORT_MENU,
  HIDE_EXPORT_MENU,
  TOGGLE_SIDEBAR,
  TOGGLE_FULLSCREEN,
  SHOW_PLAYER_PANEL,
  HIDE_PLAYER_PANEL,
  EXPORT_DATA_FETCHING,
  EXPORT_DATA_FETCHED,
  SET_APP_READY,
  DEFAULT_STATE
} = require("../constans");

const initialState = Object.assign({}, DEFAULT_STATE.UI, {
  loaded: false
});

module.exports = (state = initialState, { type }) => {
  switch (type) {
    case SET_APP_READY:
      return Object.assign({}, state, { loaded: true });
    case EXPORT_DATA_FETCHING:
      return Object.assign({}, state, { loaded: false });
    case EXPORT_DATA_FETCHED:
      return Object.assign({}, state, { loaded: true });
    case TOGGLE_SIDEBAR:
      return Object.assign({}, state, { sidebarOpen: !state.sidebarOpen });
      break;
    case TOGGLE_FULLSCREEN:
      return Object.assign({}, state, { fullScreenMode: !state.fullScreenMode, playerPanelVisible: true });
      break;
    case SHOW_PLAYER_PANEL:
      return Object.assign({}, state, { playerPanelVisible: true });
      break;
    case HIDE_PLAYER_PANEL:
      return Object.assign({}, state, { playerPanelVisible: !!state.fullScreenMode ? false : true });
      break;
    case SHOW_EXPORT_MENU:
      return Object.assign({}, state, { exportMenuOpen: true });
      break;
    case HIDE_EXPORT_MENU:
      return Object.assign({}, state, { exportMenuOpen: false });
      break;
    default:
      return state;
  }
};
