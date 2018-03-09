const React = require("react");
const { connect } = require("react-redux");
const moment = require("moment");
const mapboxgl = require("mapbox-gl");
const mapboxglGeoconder = require("mapbox-gl-geocoder");
const { rgbaObjectToString } = require("../utils");

const PlayerPanel = require("./player-panel");
const { setCoordinates } = require("../actions");

mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN;

const setupMap = map => {
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

  map.on("load", () => {
    // sources and layers
    map.addSource(sourceId, {
      type: "vector",
      tiles: [document.location.origin + "/api/tile/{z}/{x}/{y}"]
    });

    const firstSymbolId = map.getStyle().layers.filter(d => d.type === "symbol")[0].id;

    map.addLayer(
      {
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
      },
      firstSymbolId
    );
    layers.polygons.push(`${layerId}-buildings-outline`);

    map.addLayer(
      {
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
      },
      firstSymbolId
    );
    highlighted.polygons.push(`${layerId}-buildings-outline-highlighted`);

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
        paint: {
          "line-color": "#02D0CA",
          "line-opacity": 0.7,
          "line-width": 2
        }
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
        paint: {
          "line-color": "#CCF5E1",
          "line-opacity": 0.5,
          "line-width": 5
        }
      },
      firstSymbolId
    );
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

        const opacity = style.enabled ? 1 : 0;
        const highlightOpacity = style.highlight.enabled ? 1 : 0;
        const lineWidth = parseFloat(style.base["line-width"]);
        const highlightLineWidth = parseFloat(style.highlight["line-width"]);

        map.setPaintProperty(layerName, "line-color", rgbaObjectToString(style.base["line-color"]));
        map.setPaintProperty(layerName, "line-opacity", opacity);
        map.setPaintProperty(layerName, "line-width", lineWidth);

        map.setPaintProperty(highlightedLayerName, "line-color", rgbaObjectToString(style.highlight["line-color"]));
        map.setPaintProperty(highlightedLayerName, "line-opacity", highlightOpacity);
        map.setPaintProperty(highlightedLayerName, "line-width", highlightLineWidth);
      });
    }
  };
};

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selectedDate: this.props.date.selected, subscribed: false };
  }

  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: this.elMap,
      style: "mapbox://styles/mapbox/dark-v9",
      center: [this.props.mapCoordinates.lng, this.props.mapCoordinates.lat],
      zoom: this.props.mapCoordinates.zoom
    });

    this.map.addControl(new mapboxgl.NavigationControl());
    this.map.addControl(
      new mapboxglGeoconder({
        accessToken: mapboxgl.accessToken
      })
    );

    const { filter: filterMap, update: updateMap } = setupMap(this.map, this.props.style);
    this.filterMap = filterMap;
    this.updateMap = updateMap;

    this.map.on("move", () => {
      this.props.setCoordinates({
        lat: this.map.getCenter().lat,
        lng: this.map.getCenter().lng,
        zoom: this.map.getZoom()
      });
    });

    this.map.on("load", () => {
      this.updateMap(this.props.style);
      this.filterMap(this.state.selectedDate);
    });
  }

  componententWillUmount() {
    this.map.remove();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.date.selected !== nextProps.date.selected) {
      this.setState({ selectedDate: nextProps.date.selected }, this.handleDateChange);
    }
  }

  subscribeToSlider = () => {
    if (this.map.areTilesLoaded()) {
      this.filterMap(this.state.selectedDate);
      this.setState({ subscribed: false }, () => this.map.off("sourcedata", this.subscribeToSlider));
    }
  };

  handleDateChange() {
    if (this.map.areTilesLoaded()) {
      this.filterMap(this.state.selectedDate);
    } else if (!this.state.subscribed) {
      this.setState({ subscribed: true }, () => this.map.on("sourcedata", this.subscribeToSlider));
    }
  }

  render() {
    return (
      <div className="map">
        <div className="map-content" style={{ position: "relative" }}>
          <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }} ref={el => (this.elMap = el)} />
        </div>
        <PlayerPanel onShareClick={this.props.onShareClick} />
      </div>
    );
  }
}

const MapConnected = connect(({ date, map }) => ({ date, mapCoordinates: map }), { setCoordinates })(Map);

module.exports = MapConnected;
