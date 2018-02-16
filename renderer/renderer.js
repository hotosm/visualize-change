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

const { mapConfig } = remote.getCurrentWindow();

mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN;

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/dark-v9",
  hash: true,
  zoom: mapConfig.zoom,
  center: [mapConfig.lng, mapConfig.lat]
});

const isLoaded = cb => {
  const loadedHandle = setInterval(() => {
    if (map.isStyleLoaded() && map.areTilesLoaded() && map.loaded()) {
      clearInterval(loadedHandle);
      cb();
    }
  }, 1);
};

map.on("load", () => {
  // sources and layers

  const sourceId = "osm";

  const roadsColor = mapConfig.style.roads["line-color"];
  const roadsOpacity = mapConfig.style.roads.enabled ? parseFloat(mapConfig.style.roads["line-opacity"]) : 0;
  const roadsLineWidth = parseFloat(mapConfig.style.roads["line-width"]);
  const roadsHighlightColor = mapConfig.style.roads.highlight["line-color"];
  const roadsHighlightOpacity = mapConfig.style.roads.highlight.enabled
    ? parseFloat(mapConfig.style.roads.highlight["line-opacity"])
    : 0;
  const roadsHighlightLineWidth = parseFloat(mapConfig.style.roads.highlight["line-width"]);

  const buildingsColor = mapConfig.style["buildings-outline"]["line-color"];
  const buildingsOpacity = mapConfig.style["buildings-outline"].enabled
    ? parseFloat(mapConfig.style["buildings-outline"]["line-opacity"])
    : 0;
  const buildingsLineWidth = parseFloat(mapConfig.style["buildings-outline"]["line-width"]);
  const buildingsHighlightColor = mapConfig.style["buildings-outline"].highlight["line-color"];
  const buildingsHighlightOpacity = mapConfig.style["buildings-outline"].highlight.enabled
    ? parseFloat(mapConfig.style["buildings-outline"].highlight["line-opacity"])
    : 0;
  const buildingsHighlightLineWidth = parseFloat(mapConfig.style["buildings-outline"].highlight["line-width"]);

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
    [`${layerId}-buildings-outline`]: [["==", "$type", "Polygon"], ["has", "building"]]
  };

  map.addSource(sourceId, {
    type: "vector",
    tiles: [
      process.env.LOCAL_DEBUG
        ? "http://localhost:4000/tile/{z}/{x}/{y}" // tiles from docker when running electron on host machine
        : "http://api:4000/tile/{z}/{x}/{y}" // docker api address inside of docker-compoes
    ]
  });

  map.addLayer({
    id: `${layerId}-buildings-outline`,
    type: "line",
    source: `${sourceId}`,
    "source-layer": `${layerId}`,
    filter: ["all"].concat(filters[`${layerId}-buildings-outline`]),
    layout: {
      "line-join": "round",
      "line-cap": "round"
    },
    paint: {
      "line-color": buildingsColor,
      "line-width": buildingsLineWidth,
      "line-opacity": buildingsOpacity
    }
  });
  layers.polygons.push(`${layerId}-buildings-outline`);

  map.addLayer({
    id: `${layerId}-buildings-outline-highlighted`,
    type: "line",
    source: `${sourceId}`,
    "source-layer": `${layerId}`,
    filter: ["all"].concat(filters[`${layerId}-buildings-outline`]),
    layout: {
      "line-join": "round",
      "line-cap": "round"
    },
    paint: {
      "line-color": buildingsHighlightColor,
      "line-width": buildingsHighlightLineWidth,
      "line-opacity": buildingsHighlightOpacity
    }
  });
  highlighted.polygons.push(`${layerId}-buildings-outline-highlighted`);

  map.addLayer({
    id: `${layerId}-roads`,
    type: "line",
    source: `${sourceId}`,
    "source-layer": `${layerId}`,
    filter: ["all"].concat(filters[`${layerId}-roads`]),
    layout: {
      "line-join": "round",
      "line-cap": "round"
    },
    paint: {
      "line-color": roadsColor,
      "line-width": roadsLineWidth,
      "line-opacity": roadsOpacity
    }
  });
  layers.lines.push(`${layerId}-roads`);

  map.addLayer({
    id: `${layerId}-roads-highlighted`,
    type: "line",
    source: `${sourceId}`,
    "source-layer": `${layerId}`,
    filter: ["all"].concat(filters[`${layerId}-roads`]),
    layout: {
      "line-join": "round",
      "line-cap": "round"
    },
    paint: {
      "line-color": roadsHighlightColor,
      "line-width": roadsHighlightLineWidth,
      "line-opacity": roadsHighlightOpacity
    }
  });
  highlighted.lines.push(`${layerId}-roads-highlighted`);

  // actual rendering
  const numUnits = moment(mapConfig.endDate).diff(moment(mapConfig.startDate), mapConfig.interval);

  const filterLayers = n => {
    const currentDate = moment(mapConfig.startDate)
      .add(n, mapConfig.interval)
      .toDate();
    const currentDateTimestamp = currentDate.getTime();
    const lastDate = moment(currentDate)
      .subtract(1, mapConfig.interval)
      .toDate();
    const lastDateTimestamp = lastDate.getTime();

    console.log(`${moment(currentDate).format("YYYY-MM-DD HH:mm:ss")} (${n}/${numUnits} [${mapConfig.interval}])`);

    const filter = [
      "all",
      ["<=", "@timestamp", Math.round(currentDateTimestamp / 1000)] // VERY IMPORTANT - timestamp is of by 1000!
    ];

    const highlightedFilter = filter.concat([[">=", "@timestamp", Math.round(lastDateTimestamp / 1000)]]);

    Object.keys(layers).forEach(layerGroupKey => {
      layers[layerGroupKey].forEach(layer => {
        map.setFilter(layer, filter.concat(filters[layer]));
      });
    });

    Object.keys(highlighted).forEach(layerGroupKey => {
      highlighted[layerGroupKey].forEach(layer => {
        // TODO: (it cuts '-highlight') nicer way of passing this things
        // arround when the final data format will be ready
        map.setFilter(
          layer,
          highlightedFilter.concat(
            filters[
              layer
                .split("-")
                .slice(0, -1)
                .join("-")
            ]
          )
        );
      });
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
  });
});
