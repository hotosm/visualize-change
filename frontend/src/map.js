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

module.exports = map => {
  map.on('load', () => {
    // sources and layers
    map.addSource(sourceId, {
      type: 'vector',
      tiles: [
        process.env.LOCAL_DEBUG
          ? 'http://localhost:4000/tile/{z}/{x}/{y}' // tiles from docker when running electron on host machine
          : 'http://localhost:8080/api/tile/{z}/{x}/{y}' // TODO: document.location...
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
  });

  return {
    filter: date => {
      const timestamp = date.getTime();

      const filter = [
        'all',
        ['<=', '@timestamp', Math.round(timestamp / 1000)] // VERY IMPORTANT - timestamp is of by 1000!
      ];

      Object.keys(layers).forEach(layerGroupKey => {
        layers[layerGroupKey].forEach(layer => {
          map.setFilter(layer, filter.concat(filters[layer]));
        });
      });
    }
  };
};
