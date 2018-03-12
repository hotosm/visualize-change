const { SET_MAP_BACKGROUND, SET_FEATURE_STYLE } = require("../constans");

const initialState = {
  background: "dark",
  features: [
    {
      name: "roads",
      enabled: true,
      baseEnabled: true,
      highlightEnabled: true,
      base: {
        "line-color": {
          r: 2,
          g: 208,
          b: 202,
          a: 0.7
        },
        "line-width": 1
      },
      highlight: {
        "line-color": {
          r: 204,
          g: 245,
          b: 225,
          a: 0.5
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
          r: 208,
          g: 2,
          b: 68,
          a: 0.7
        },
        "line-width": 1
      },
      highlight: {
        "line-color": {
          r: 235,
          g: 150,
          b: 215,
          a: 1
        },
        "line-width": 1
      }
    }
  ]
};

module.exports = (state = initialState, { type, payload }) => {
  switch (type) {
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
