const { SET_MAP_BACKGROUND, SET_FEATURE_STYLE, EXPORT_DATA_FETCHED, DEFAULT_STATE } = require("../constans");

const initialState = DEFAULT_STATE.STYLE;

module.exports = (state = initialState, { type, payload }) => {
  switch (type) {
    case EXPORT_DATA_FETCHED:
      return Object.assign({}, initialState, payload.config.style);
    case SET_MAP_BACKGROUND:
      return Object.assign({}, state, { background: payload });
      break;
    case SET_FEATURE_STYLE:
      return Object.assign({}, state, {
        features: state.features.map((style, idx) => (idx === payload.selectedIndex ? payload.newStyle : style))
      });
      break;
    default:
      return state;
  }
};
