const { SET_MAP_BACKGROUND, SET_FEATURE_STYLE, EXPORT_DATA_FETCHED } = require("../constans");

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
};

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
