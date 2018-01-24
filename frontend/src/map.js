module.exports = map => {
  const layers = {
    pts: [],
    lines: [],
    polygons: []
  };

  map.on("load", () => {
    // sources and layers

    const sourceId = "osm";
    const layerId = "osm";
    const layerColor = "#FF0000";

    map.addSource(sourceId, {
      type: "vector",
      tiles: [
        process.env.LOCAL_DEBUG
          ? "http://localhost:4000/tile/{z}/{x}/{y}" // tiles from docker when running electron on host machine
          : "http://localhost:8080/api/tile/{z}/{x}/{y}" // TODO: document.location...
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
  });

  return {
    filter: date => {
      const timestamp = date.getTime();

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
    }
  };
};
