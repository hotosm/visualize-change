const { SET_COORDINATES } = require("../constans");

const initialState = {
  lat: -8.343,
  lng: 115.507,
  zoom: 12
};

module.exports = (state = initialState, { type, payload }) => {
  switch (type) {
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
