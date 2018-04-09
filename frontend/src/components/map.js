const React = require("react");
const { connect } = require("react-redux");
const mapboxgl = require("mapbox-gl");
const mapboxglGeoconder = require("mapbox-gl-geocoder");
const classNames = require("classnames");
const { rgbaObjectToString } = require("../utils");

const PlayerPanelConnected = require("./player-panel");
const { setCoordinates, showExportMenu } = require("../actions");

// TODO: Maybe types in object instead of this? Or some regex for '-color' ?
const parseValue = value => (typeof value === "object" ? rgbaObjectToString(value) : parseFloat(value));

mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN;

const { Intent } = require("@blueprintjs/core");

const AppToaster = require("./toaster");

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
    [`${layerId}-buildings`]: [["==", "$type", "Polygon"], ["has", "building"]]
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
        id: `${layerId}-buildings`,
        type: "line",
        source: `${sourceId}`,
        "source-layer": `${layerId}`,
        filter: ["all"].concat(filters[`${layerId}-buildings`]),
        layout: {
          "line-join": "round",
          "line-cap": "round"
        }
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
        }
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
        }
      },
      firstSymbolId
    );
    highlighted.lines.push(`${layerId}-roads-highlighted`);
  });

  return {
    filter: (date, interval) => {
      const timestamp = date / 1000;

      const filter = ["all", ["<=", "@timestamp", timestamp]];

      // TODO: This varies between renderer, cause we dont want to use moment there.
      const intervalSteps = {
        hours: 3600,
        days: 86400,
        weeks: 604800
      };

      const highlightedFilter = filter.concat([[">=", "@timestamp", timestamp - intervalSteps[interval]]]);

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

        map.setPaintProperty(
          highlightedLayerName,
          "line-opacity",
          !feature.enabled || !feature.highlightEnabled ? 0 : 1
        );
      });
    }
  };
};

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.toastKey = null;
    this.state = { selectedDate: this.props.date.selected, subscribed: false };
  }

  initMap(props) {
    if (this.map) this.map.remove();
    this.map = new mapboxgl.Map({
      container: this.elMap,
      style: `mapbox://styles/mapbox/${props.style.background}-v9`,
      center: [props.mapCoordinates.lng, props.mapCoordinates.lat],
      zoom: props.mapCoordinates.zoom
    });

    this.map.addControl(new mapboxgl.NavigationControl());
    this.map.addControl(
      new mapboxglGeoconder({
        accessToken: mapboxgl.accessToken,
        zoom: 12
      })
    );

    this.map.addControl(new mapboxgl.ScaleControl(), "bottom-right");

    const { filter: filterMap, update: updateMap } = setupMap(this.map, props.style);
    this.filterMap = filterMap;
    this.updateMap = updateMap;

    this.map.on("move", () => {
      props.setCoordinates({
        lat: this.map.getCenter().lat,
        lng: this.map.getCenter().lng,
        zoom: this.map.getZoom()
      });
    });

    this.map.on("load", () => {
      console.log("LOADED");
      this.updateMap(props.style);
      this.filterMap(this.state.selectedDate, props.date.interval);

      this.isMapReady = makeTileReadyCheck(this.map, "osm");
    });
  }

  componentDidMount() {
    this.initMap(this.props);
  }

  componententWillUmount() {
    this.map.remove();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.date.selected !== nextProps.date.selected) {
      this.setState({ selectedDate: nextProps.date.selected }, this.handleDateChange);
    }

    this.updateMap(nextProps.style);

    if (this.props.style.background !== nextProps.style.background) {
      this.initMap(nextProps);
    }

    if (nextProps.mapCoordinates.zoom < 11 && AppToaster.getToasts().length < 1) {
      this.toastKey = AppToaster.show({
        key: "zoom",
        message: "Not supported zoom",
        intent: Intent.DANGER,
        timeout: 0,
        action: {
          onClick: () => this.map.setZoom(11),
          text: "Get me back to supported zoom levels"
        }
      });
    }

    if (nextProps.mapCoordinates.zoom >= 12 && this.toastKey) {
      AppToaster.dismiss(this.toastKey);
    }
  }

  subscribeToSlider = () => {
    if (this.isMapReady()) {
      this.filterMap(this.state.selectedDate, this.props.date.interval);
      this.setState({ subscribed: false }, () => this.map.off("sourcedata", this.subscribeToSlider));
    }
  };

  handleDateChange() {
    if (this.isMapReady()) {
      this.filterMap(this.state.selectedDate, this.props.date.interval);
    } else if (!this.state.subscribed) {
      this.setState({ subscribed: true }, () => this.map.on("sourcedata", this.subscribeToSlider));
    }
  }

  render() {
    return (
      <div className={classNames("map", { "full-screen-mode": this.props.isFullScreenMode })}>
        <div className="map-content" style={{ position: "relative" }}>
          <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }} ref={el => (this.elMap = el)} />
        </div>
        <PlayerPanelConnected />
      </div>
    );
  }
}

const MapConnected = connect(
  ({ date, map, style, ui }) => ({ date, mapCoordinates: map, style, isFullScreenMode: ui.fullScreenMode }),
  {
    setCoordinates,
    showExportMenu
  }
)(Map);

module.exports = MapConnected;
