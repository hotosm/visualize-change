module.exports = (map, styles) => {
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
    [`${layerId}-buildings-outline`]: [["==", "$type", "Polygon"], ["has", "building"]]
  };

  console.log("s", styles);

  map.on("load", () => {
    // sources and layers
    map.addSource(sourceId, {
      type: "vector",
      tiles: [
        process.env.LOCAL_DEBUG
          ? "http://localhost:4000/tile/{z}/{x}/{y}" // tiles from docker when running electron on host machine
          : "http://localhost:8080/api/tile/{z}/{x}/{y}" // TODO: document.location...
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
        "line-color": "#D00244",
        "line-opacity": 0.4
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
        "line-color": "#EB96D7",
        "line-opacity": 0.8,
        "line-width": 2
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
        "line-color": "#02D0CA",
        "line-opacity": 0.7,
        "line-width": 2
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
        "line-color": "#CCF5E1",
        "line-opacity": 0.5,
        "line-width": 5
      }
    });
    highlighted.lines.push(`${layerId}-roads-highlighted`);
  });

  return {
    filter: date => {
      const timestamp = date.getTime();

      const filter = [
        "all",
        ["<=", "@timestamp", Math.round(timestamp / 1000)] // VERY IMPORTANT - timestamp is of by 1000!
      ];

      const highlightedFilter = filter.concat([[">=", "@timestamp", Math.round(timestamp / 1000) - 86400]]);

      Object.keys(layers).forEach(layerGroupKey => {
        layers[layerGroupKey].forEach(layer => {
          map.setFilter(layer, filter.concat(filters[layer]));
        });
      });

      Object.keys(highlighted).forEach(layerGroupKey => {
        highlighted[layerGroupKey].forEach(layer => {
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
    },

    update: styles => {
      Object.keys(styles).forEach(styleKey => {
        const style = styles[styleKey];
        const layerName = `${layerId}-${styleKey}`;
        const highlightedLayerName = `${layerName}-highlighted`;

        const opacity = style.enabled ? parseFloat(style["line-opacity"]) : 0;
        const highlightOpacity = style.highlight.enabled ? parseFloat(style.highlight["line-opacity"]) : 0;
        const lineWidth = parseFloat(style["line-width"]);
        const highlightLineWidth = parseFloat(style.highlight["line-width"]);

        map.setPaintProperty(layerName, "line-color", style["line-color"]);
        map.setPaintProperty(layerName, "line-opacity", opacity);
        map.setPaintProperty(layerName, "line-width", lineWidth);

        map.setPaintProperty(highlightedLayerName, "line-color", style.highlight["line-color"]);
        map.setPaintProperty(highlightedLayerName, "line-opacity", highlightOpacity);
        map.setPaintProperty(highlightedLayerName, "line-width", highlightLineWidth);
      });
    }
  };
};
