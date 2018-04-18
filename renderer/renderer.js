// move errors to cli console when running in non-debug mode
if (!process.env.LOCAL_DEBUG) {
  const NodeConsole = require("console").Console;

  window.console = new NodeConsole(process.stdout, process.stderr);
  console = new NodeConsole(process.stdout, process.stderr);
}

const { RENDERING_SHOT, RENDERING_DONE } = require("./common");

const moment = require("moment");
const mapboxgl = require("mapbox-gl");
const { ipcRenderer, remote } = require("electron");

const rgbaObjectToString = obj => `rgba(${obj.r}, ${obj.g}, ${obj.b}, ${obj.a})`;
const parseValue = value => (typeof value === "object" ? rgbaObjectToString(value) : parseFloat(value));

const { mapConfig } = remote.getCurrentWindow();

mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN;

// workaround for https://github.com/mapbox/mapbox-gl-js/issues/5874
const makeTileReadyCheck = (map, sourceId) => {
  const tileState = {};

  return () => {
    return Object.keys(map.style.sourceCaches[sourceId]._tiles).every(key => {
      const { state } = map.style.sourceCaches[sourceId]._tiles[key];

      // TODO: Fixme
      const isReady = state === "loaded" || state === "loading" || state === "errored";
      const wasErrored = tileState[key] === "errored";

      if (!isReady && wasErrored) {
        return true;
      }

      tileState[key] = state;
      return isReady;
    });
  };
};

const map = new mapboxgl.Map({
  container: "map",
  style: `mapbox://styles/mapbox/${mapConfig.style.background}-v9`,
  hash: true,
  zoom: mapConfig.zoom,
  center: [mapConfig.lng, mapConfig.lat]
});

const isMapReady = makeTileReadyCheck(map, "osm");

const isLoaded = cb => {
  const loadedHandle = setInterval(() => {
    if (map.isStyleLoaded() && isMapReady() && map.loaded()) {
      clearInterval(loadedHandle);
      cb();
    }
  }, 1);
};

map.on("load", () => {
  // sources and layers

  const sourceId = "osm";

  const layerId = "osm";

  const layers = {
    pts: [],
    lines: [],
    polygons: []
  };

  const highlighted = {
    pts: [],
    lines: [],
    polygons: []
  };

  const filters = {
    [`${layerId}-roads`]: [
      ["==", "$type", "LineString"],
      ["==", "@type", "way"],
      ["has", "highway"],
      ["!has", "building"],
      ["!has", "landuse"]
    ],
    [`${layerId}-buildings`]: [["==", "$type", "Polygon"], ["has", "building"]]
  };

  const firstSymbolId = map.getStyle().layers.filter(d => d.type === "symbol")[0].id;

  map.addSource(sourceId, {
    type: "vector",
    tiles: [
      process.env.LOCAL_DEBUG
        ? "http://localhost:4000/tile/{z}/{x}/{y}" // tiles from docker when running electron on host machine
        : "http://api:4000/tile/{z}/{x}/{y}" // docker api address inside of docker-compoes
    ],
    maxzoom: 12
  });

  map.addLayer(
    {
      id: `${layerId}-buildings`,
      type: "line",
      source: `${sourceId}`,
      "source-layer": `${layerId}`,
      filter: ["all"].concat(filters[`${layerId}-buildings`]),
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      minzoom: 12
    },
    firstSymbolId
  );
  layers.polygons.push(`${layerId}-buildings`);

  map.addLayer(
    {
      id: `${layerId}-buildings-highlighted`,
      type: "line",
      source: `${sourceId}`,
      "source-layer": `${layerId}`,
      filter: ["all"].concat(filters[`${layerId}-buildings`]),
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      minzoom: 12
    },
    firstSymbolId
  );
  highlighted.polygons.push(`${layerId}-buildings-highlighted`);

  map.addLayer(
    {
      id: `${layerId}-roads`,
      type: "line",
      source: `${sourceId}`,
      "source-layer": `${layerId}`,
      filter: ["all"].concat(filters[`${layerId}-roads`]),
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      minzoom: 12
    },
    firstSymbolId
  );
  layers.lines.push(`${layerId}-roads`);

  map.addLayer(
    {
      id: `${layerId}-roads-highlighted`,
      type: "line",
      source: `${sourceId}`,
      "source-layer": `${layerId}`,
      filter: ["all"].concat(filters[`${layerId}-roads`]),
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      minzoom: 12
    },
    firstSymbolId
  );
  highlighted.lines.push(`${layerId}-roads-highlighted`);

  // actual rendering
  const numUnits = moment(mapConfig.endDate).diff(moment(mapConfig.startDate), mapConfig.interval);

  const filterLayers = n => {
    const currentDate = moment(mapConfig.startDate)
      .add(n, mapConfig.interval)
      .toDate();
    const timestamp = moment(currentDate).unix();
    const interval = mapConfig.interval;
    // const lastDate = moment(currentDate)
    //   .subtract(1, mapConfig.interval)
    //   .toDate();
    // const lastDateTimestamp = lastDate.unix();

    console.log(`${moment(currentDate).format("YYYY-MM-DD HH:mm:ss")} (${n}/${numUnits} [${mapConfig.interval}])`);

    const makeFilter = timestamp => ["<=", "@timestamp", timestamp];

    const makeHighlightFilter = timestamp => {
      // TODO: This varies between renderer, cause we dont want to use moment there.
      const intervalSteps = {
        hours: 3600,
        days: 86400,
        weeks: 604800
      };

      return [["<=", "@timestamp", timestamp], [">=", "@timestamp", timestamp - intervalSteps[interval]]];
    };

    Object.keys(layers).forEach(layerGroupKey => {
      layers[layerGroupKey].forEach(layer => {
        const baseFilters = filters[layer];

        map.setFilter(layer, ["all", makeFilter(timestamp), ...baseFilters]);
      });
    });

    Object.keys(highlighted).forEach(layerGroupKey => {
      highlighted[layerGroupKey].forEach(layer => {
        const baseFilters =
          filters[
            layer
              .split("-")
              .slice(0, -1)
              .join("-")
          ];

        map.setFilter(layer, ["all", ...makeHighlightFilter(timestamp), ...baseFilters]);
      });
    });
  };

  const setStyles = styles => {
    styles.features.forEach(feature => {
      const layerName = `${layerId}-${feature.name}`;
      const highlightedLayerName = `${layerName}-highlighted`;

      Object.keys(feature.base).forEach(styleName => {
        map.setPaintProperty(layerName, styleName, parseValue(feature.base[styleName]));
      });

      Object.keys(feature.highlight).forEach(styleName => {
        map.setPaintProperty(highlightedLayerName, styleName, parseValue(feature.highlight[styleName]));
      });

      // TODO: This should go out in future and we should manager to disable / enabled layers
      map.setPaintProperty(layerName, "line-opacity", !feature.enabled || !feature.baseEnabled ? 0 : 1);

      map.setPaintProperty(highlightedLayerName, "line-opacity", !feature.enabled || !feature.highlightEnabled ? 0 : 1);
    });
  };

  isLoaded(() => {
    const renderImg = n => {
      isLoaded(() => {
        ipcRenderer.sendSync(RENDERING_SHOT, n);
        filterLayers(n);

        if (n < numUnits) {
          renderImg(n + 1);
        } else {
          ipcRenderer.sendSync(RENDERING_DONE);
        }
      });
    };

    filterLayers(0);
    renderImg(0);
    setStyles(mapConfig.style);
  });
});
