// HACK: move errors to cli console when running in non-debug mode
if (!process.env.LOCAL_DEBUG) {
  const NodeConsole = require("console").Console;

  window.console = new NodeConsole(process.stdout, process.stderr);
  console = new NodeConsole(process.stdout, process.stderr);
}

const { RENDERING_SHOT, RENDERING_DONE } = require("./common");

const moment = require("moment");
const mapboxgl = require("mapbox-gl");
const { ipcRenderer, remote } = require("electron");

const { renderingConfig } = remote.getCurrentWindow();

// TODO: move to docker env: https://docs.docker.com/compose/environment-variables/ (passing environment variables through to containers"
mapboxgl.accessToken =
  "pk.eyJ1Ijoic3p5bW9uayIsImEiOiJjamNmenY2d2oxOHJsMzNyd2dkdXAweWpsIn0.EnpGgGzuSUfAtE7WLkXdyQ";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/basic-v9",
  hash: true,
  zoom: renderingConfig.zoom || 12,
  center: [renderingConfig.lon, renderingConfig.lat]
});

const isLoaded = cb => {
  const loadedHandle = setInterval(() => {
    if (map.isStyleLoaded() && map.areTilesLoaded() && map.loaded()) {
      cb();
      clearInterval(loadedHandle);
    }
  }, 1);
};

map.on("load", () => {
  // sources and layers

  const sourceId = "osm";
  const layerId = "osm";
  const layerColor = "#FF0000";

  const layers = {
    pts: [],
    lines: [],
    polygons: []
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
    id: `${layerId}-polygons`,
    type: "fill",
    source: `${sourceId}`,
    "source-layer": `${layerId}`,
    filter: ["==", "$type", "Polygon"],
    layout: {},
    paint: {
      "fill-opacity": 0.5,
      "fill-color": layerColor
    }
  });
  layers.polygons.push(`${layerId}-polygons`);

  map.addLayer({
    id: `${layerId}-polygons-outline`,
    type: "line",
    source: `${sourceId}`,
    "source-layer": `${layerId}`,
    filter: ["==", "$type", "Polygon"],
    layout: {
      "line-join": "round",
      "line-cap": "round"
    },
    paint: {
      "line-color": layerColor,
      "line-width": 0,
      "line-opacity": 0.75
    }
  });
  layers.polygons.push(`${layerId}-polygons-outline`);

  map.addLayer({
    id: `${layerId}-lines`,
    type: "line",
    source: `${sourceId}`,
    "source-layer": `${layerId}`,
    filter: ["==", "$type", "LineString"],
    layout: {
      "line-join": "round",
      "line-cap": "round"
    },
    paint: {
      "line-color": layerColor,
      "line-width": 1,
      "line-opacity": 0.75
    }
  });
  layers.lines.push(`${layerId}-lines`);

  map.addLayer({
    id: `${layerId}-pts`,
    type: "circle",
    source: `${sourceId}`,
    "source-layer": `${layerId}`,
    filter: ["==", "$type", "Point"],
    paint: {
      "circle-color": layerColor,
      "circle-radius": 2.5,
      "circle-opacity": 0.75
    }
  });
  layers.pts.push(`${layerId}-pts`);

  // actual rendering
  const startDate = new Date(renderingConfig.startDate);
  const endDate = new Date(renderingConfig.endDate);
  const numDays = moment(endDate).diff(moment(startDate), "days");

  const filterLayers = n => {
    const currentDate = moment(startDate)
      .add(n, "d")
      .toDate();

    const timestamp = currentDate.getTime();

    console.log(
      `${moment(currentDate).format("YYYY-MM-DD")} (${n}/${numDays})`
    );

    const filter = [
      "all",
      ["<=", "@timestamp", Math.round(timestamp / 1000)], // VERY IMPORTANT - timestamp is of by 1000!
      ["has", "highway"]
    ];

    Object.keys(layers).forEach(layerGroupKey => {
      layers[layerGroupKey].forEach(layer => {
        map.setFilter(layer, filter);
      });
    });
  };

  isLoaded(() => {
    const renderImg = n => {
      isLoaded(() => {
        ipcRenderer.sendSync(RENDERING_SHOT, n);
        filterLayers(n);

        if (n < numDays) {
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
