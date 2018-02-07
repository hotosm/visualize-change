// HACK: move errors to cli console when running in non-debug mode
if (!process.env.LOCAL_DEBUG) {
  const NodeConsole = require('console').Console;

  window.console = new NodeConsole(process.stdout, process.stderr);
  console = new NodeConsole(process.stdout, process.stderr);
}

const { RENDERING_SHOT, RENDERING_DONE } = require('./common');

const moment = require('moment');
const mapboxgl = require('mapbox-gl');
const { ipcRenderer, remote } = require('electron');

const { renderingConfig } = remote.getCurrentWindow();

// TODO: move to docker env: https://docs.docker.com/compose/environment-variables/ (passing environment variables through to containers"
mapboxgl.accessToken = 'pk.eyJ1Ijoic3p5bW9uayIsImEiOiJjamNmenY2d2oxOHJsMzNyd2dkdXAweWpsIn0.EnpGgGzuSUfAtE7WLkXdyQ';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v9',
  hash: true,
  zoom: renderingConfig.zoom || 12,
  center: [renderingConfig.lng, renderingConfig.lat]
});

const isLoaded = cb => {
  const loadedHandle = setInterval(() => {
    if (map.isStyleLoaded() && map.areTilesLoaded() && map.loaded()) {
      cb();
      clearInterval(loadedHandle);
    }
  }, 1);
};

map.on('load', () => {
  // sources and layers

  const sourceId = 'osm';
  const roadsColor = '#50E3C2';
  const layerId = 'osm';

  const layers = {
    pts: [],
    lines: [],
    polygons: []
  };

  const filters = {
    [`${layerId}-roads`]: [
      ['==', '$type', 'LineString'],
      ['==', '@type', 'way'],
      ['has', 'highway'],
      ['!has', 'building'],
      ['!has', 'landuse']
    ],
    [`${layerId}-buildings-outline`]: [['==', '$type', 'Polygon'], ['has', 'building']]
  };

  map.addSource(sourceId, {
    type: 'vector',
    tiles: [
      process.env.LOCAL_DEBUG
        ? 'http://localhost:4000/tile/{z}/{x}/{y}' // tiles from docker when running electron on host machine
        : 'http://api:4000/tile/{z}/{x}/{y}' // docker api address inside of docker-compoes
    ]
  });

  map.addLayer({
    id: `${layerId}-buildings-outline`,
    type: 'line',
    source: `${sourceId}`,
    'source-layer': `${layerId}`,
    filter: ['all'].concat(filters[`${layerId}-buildings-outline`]),
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#D00244',
      'line-width': 2,
      'line-opacity': 0.4
    }
  });
  layers.polygons.push(`${layerId}-buildings-outline`);

  map.addLayer({
    id: `${layerId}-roads`,
    type: 'line',
    source: `${sourceId}`,
    'source-layer': `${layerId}`,
    filter: ['all'].concat(filters[`${layerId}-roads`]),
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#50E3C2',
      'line-width': 5,
      'line-opacity': 0.5
    }
  });
  layers.lines.push(`${layerId}-roads`);

  // actual rendering
  const startDate = new Date(renderingConfig.startDate);
  const endDate = new Date(renderingConfig.endDate);
  const numDays = moment(endDate).diff(moment(startDate), 'days');

  const filterLayers = n => {
    const currentDate = moment(startDate)
      .add(n, 'd')
      .toDate();

    const timestamp = currentDate.getTime();

    console.log(`${moment(currentDate).format('YYYY-MM-DD')} (${n}/${numDays})`);

    const filter = [
      'all',
      ['<=', '@timestamp', Math.round(timestamp / 1000)] // VERY IMPORTANT - timestamp is of by 1000!
    ];

    Object.keys(layers).forEach(layerGroupKey => {
      layers[layerGroupKey].forEach(layer => {
        map.setFilter(layer, filter.concat(filters[layer]));
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
