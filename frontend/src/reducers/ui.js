const { SHOW_EXPORT_MENU, HIDE_EXPORT_MENU, TOGGLE_SIDEBAR, EXPORT_DATA_FETCHED } = require("../constans");
const initialState = {
  sidebarOpen: true,
  exportMenuOpen: false,
  loaded: false
};

module.exports = (state = initialState, { type, payload }) => {
  switch (type) {
    case EXPORT_DATA_FETCHED:
      return Object.assign({}, state, { loaded: true });
    case TOGGLE_SIDEBAR:
      return Object.assign({}, state, { sidebarOpen: !state.sidebarOpen });
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
