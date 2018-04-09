const { SET_COORDINATES, EXPORT_DATA_FETCHED, DEFAULT_STATE } = require("../constans");

const initialState = DEFAULT_STATE.MAP;

module.exports = (state = initialState, { type, payload }) => {
  switch (type) {
    case EXPORT_DATA_FETCHED:
      return Object.assign({}, initialState, payload.config.map);
    case SET_COORDINATES:
      return Object.assign({}, state, {
        lat: payload.lat || state.lat,
        lng: payload.lng || state.lng,
        zoom: payload.zoom || state.zoom
      });
      break;
    default:
      return state;
  }
};
