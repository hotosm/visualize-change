const initialState = {
  background: "dark",
  style: {
    roads: {
      enabled: true,
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
        enabled: true,
        "line-color": {
          r: 204,
          g: 245,
          b: 225,
          a: 0.5
        },
        "line-width": 1
      }
    },
    "buildings-outline": {
      enabled: true,
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
        enabled: true,
        "line-color": {
          r: 235,
          g: 150,
          b: 215,
          a: 1
        },
        "line-width": 1
      }
    }
  }
};
