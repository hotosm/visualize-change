// HACK: move errors to cli console
const NodeConsole = require("console").Console;
window.console = new NodeConsole(process.stdout, process.stderr);

const mapboxgl = require("mapbox-gl");
const { ipcRenderer } = require("electron");

mapboxgl.accessToken =
  "pk.eyJ1IjoibHVrYXNtYXJ0aW5lbGxpIiwiYSI6ImNqMXMyYTRuejAwOHkzM3Frbjg1ZW9kNnAifQ.F5tkdGnKJMv4yaYZNOTJ5w";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/lukasmartinelli/cj1rztb6o000g2st2zlb7mp7t",
  center: [24.323, -19.036],
  zoom: 5.8,
  maxZoom: 14,
  minZoom: 1,
  hash: true
});

const styleByDay = day => {
  const layers = [
    "malaria-building-point",
    "malaria-building-glow",
    "malaria-building-shape"
  ];
  const filter = ["<=", "@day", day];

  layers.forEach(layer => {
    map.setFilter(layer, filter);
  });
};

// const MAX_IMAGES = 400;
const MAX_IMAGES = 10;

const isLoaded = cb => {
  const loadedHandle = setInterval(() => {
    if (map.isStyleLoaded() && map.areTilesLoaded() && map.loaded()) {
      cb();
      clearInterval(loadedHandle);
    }
  }, 1);
};

isLoaded(() => {
  const renderImg = c => {
    isLoaded(() => {
      console.log(c);
      ipcRenderer.sendSync("SHOT", c);
      styleByDay(c);

      if (c < MAX_IMAGES) {
        renderImg(c + 1);
      } else {
        ipcRenderer.sendSync("DONE");
      }
    });
  };

  styleByDay(0);
  renderImg(0);
});
