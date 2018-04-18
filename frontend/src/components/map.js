const React = require("react");
const { connect } = require("react-redux");
const mapboxgl = require("mapbox-gl");
const mapboxglGeoconder = require("mapbox-gl-geocoder");
const classNames = require("classnames");
const { capitalizeFirstLetter, rgbaObjectToString } = require("../utils");

const PlayerPanelConnected = require("./player-panel");
const { setCoordinates, showExportMenu, setMapLoading, setMapLoaded } = require("../actions");

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

  // sources and layers
  map.addSource(sourceId, {
    type: "vector",
    tiles: [document.location.origin + "/api/tile/{z}/{x}/{y}"],
    maxzoom: 12
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

  return {
    filter: (date, interval) => {
      const timestamp = date / 1000;

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

const MapLegend = ({ features }) => (
  <div className="map-legend" style={{ position: "absolute", bottom: 85, right: 2 }}>
    {features.map((style, idx) => (
      <label key={idx} className="inline-label">
        <div
          className="map-legend__square"
          style={{ backgroundColor: rgbaObjectToString(Object.assign({}, style.base["line-color"], { a: 1 })) }}
        />
        {capitalizeFirstLetter(style.name)}
      </label>
    ))}
  </div>
);

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.toastKey = null;
    this.state = { selectedDate: this.props.date.selected, subscribed: false };
  }

  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: this.elMap,
      style: `mapbox://styles/mapbox/${this.props.style.background}-v9`,
      center: [this.props.mapCoordinates.lng, this.props.mapCoordinates.lat],
      zoom: this.props.mapCoordinates.zoom
    });

    this.map.addControl(
      new mapboxgl.NavigationControl({
        showCompass: false
      })
    );

    const geocoder = new mapboxglGeoconder({
      accessToken: mapboxgl.accessToken,
      flyTo: false
    });

    geocoder.on("result", e => {
      if (e.result && e.result.center) {
        this.map.flyTo({
          center: e.result.center,
          zoom: 12,
          speed: 2.0
        });
      }
    });

    this.map.addControl(geocoder);
    this.map.dragRotate.disable();

    this.map.addControl(new mapboxgl.ScaleControl(), "bottom-right");

    this.map.on("load", () => {
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

      this.updateMap(this.props.style);
      this.filterMap(this.state.selectedDate, this.props.date.interval);

      this.isMapReady = makeTileReadyCheck(this.map, "osm");

      this.loadedIntervalHandle = setInterval(() => {
        const isMapLoaded = this.map.loaded();

        if (isMapLoaded && !this.props.isMapLoaded) {
          this.props.setMapLoaded();
        }

        if (!isMapLoaded && this.props.isMapLoaded) {
          this.props.setMapLoading();
        }
      }, 100);
    });
  }

  componententWillUmount() {
    clearInterval(this.loadedIntervalHandle);
    this.map.remove();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.mapCoordinates.zoom < 12 && AppToaster.getToasts().length < 1) {
      this.toastKey = AppToaster.show({
        key: "zoom",
        message: "Zoom in to see data.",
        intent: Intent.DANGER,
        timeout: 0,
        action: {
          onClick: () => this.map.setZoom(12),
          text: "Take me to supported zoom levels."
        }
      });
    }

    if (nextProps.mapCoordinates.zoom >= 12 && this.toastKey) {
      AppToaster.dismiss(this.toastKey);
    }

    if (this.props.mapCoordinates.zoom !== nextProps.mapCoordinates.zoom && nextProps.mapCoordinates.zoom === 0) {
      this.map.setZoom(nextProps.mapCoordinates.zoom);
    }

    // FIXME: well, this maybe should wait for map to be ready, and then do the update? instead of just discarding?
    if (!(this.map.loaded() && this.map.isStyleLoaded() && this.map.areTilesLoaded())) {
      return;
    }

    if (this.props.style.background !== nextProps.style.background) {
      this.map.setStyle(`mapbox://styles/mapbox/${nextProps.style.background}-v9`);

      // mapboxgl is terrible, changing style removes layers/sources as well...
      const waitForReady = setInterval(() => {
        if (this.map.loaded()) {
          clearInterval(waitForReady);

          const { filter: filterMap, update: updateMap } = setupMap(this.map, nextProps.style);

          this.filterMap = filterMap;
          this.updateMap = updateMap;

          this.updateMap(nextProps.style);
        }
      }, 10);

      return;
    }

    if (this.props.date.selected !== nextProps.date.selected) {
      this.setState({ selectedDate: nextProps.date.selected }, this.handleDateChange);
    }

    this.updateMap(nextProps.style);
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
          <MapLegend features={this.props.style.features} />
        </div>
        <PlayerPanelConnected />
      </div>
    );
  }
}

const MapConnected = connect(
  ({ date, map, style, ui, router }) => ({
    date,
    mapCoordinates: map,
    style,
    isFullScreenMode: ui.fullScreenMode,
    isMapLoaded: ui.mapLoaded,
    router
  }),
  {
    setCoordinates,
    setMapLoading,
    setMapLoaded,
    showExportMenu
  }
)(Map);

module.exports = MapConnected;
