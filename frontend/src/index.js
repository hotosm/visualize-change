const React = require("react");
const ReactDOM = require("react-dom");
const mapboxgl = require("mapbox-gl");
const moment = require("moment");
const set = require("lodash.set");

require("mapbox-gl/dist/mapbox-gl.css");

const setupMap = require("./map");

mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN;

const IS_DEBUG = window.location.href.indexOf("debug") > 0;

const DatePicker = ({ onInput, value }) => (
  <input type="date" defaultValue={value} onInput={e => onInput(e.target.value)} />
);

const FloatNumberPicker = ({ onInput, value = 0.0 }) => (
  <input type="number" step="any" value={value} onChange={e => onInput(e.target.value)} />
);

class App extends React.Component {
  constructor() {
    super();

    this.state = {
      lat: -8.343,
      lng: 115.507,
      zoom: 12,
      startDate: "2018-01-01",
      endDate: "2018-02-01",
      interval: "days",
      email: "test@test.test",
      style: {
        roads: {
          enabled: true,
          "line-color": "#02D0CA",
          "line-opacity": 0.7,
          highlight: {
            enabled: false,
            "line-color": "#CCF5E1",
            "line-opacity": 0.5
          }
        },
        "buildings-outline": {
          enabled: true,
          "line-color": "#D00244",
          "line-opacity": 0.7,
          highlight: {
            enabled: false,
            "line-color": "#EB96D7",
            "line-opacity": 0.8
          }
        }
      },
      features: {}
    };
  }

  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: this.elMap,
      style: "mapbox://styles/mapbox/dark-v9",
      center: [this.state.lng, this.state.lat],
      zoom: this.state.zoom
    });

    this.map.addControl(new mapboxgl.NavigationControl());

    // add layers
    const { filter: filterMap, update: updateMap } = setupMap(this.map, this.state.style);
    this.filterMap = filterMap;
    this.updateMap = updateMap;

    this.map.on("move", () => {
      // FIXME: setting position from updatePosition triggers this as well, not a problem for now though..?
      this.setState({
        lat: this.map.getCenter().lat,
        lng: this.map.getCenter().lng,
        zoom: this.map.getZoom()
      });
    });

    // https://www.mapbox.com/mapbox-gl-js/example/queryrenderedfeatures/
    if (IS_DEBUG) {
      this.map.on("mousemove", e => {
        const features = this.map.queryRenderedFeatures(e.point);
        this.setState({ features });
      });
    }

    this.map.on("load", () => {
      this.updateMap(this.state.style);
    });
  }

  componententWillUmoun() {
    this.map.remove();
  }

  onClickRender = () => {
    // TODO: We need to check if styles are valid also, for ex. color values
    const mapConfig = {
      lat: this.state.lat,
      lng: this.state.lng,
      zoom: this.state.zoom,
      email: this.state.email,
      startDate: moment(this.state.startDate).toISOString(),
      endDate: moment(this.state.endDate).toISOString(),
      interval: this.state.interval,
      style: this.state.style
    };

    fetch("/api/queue-render", {
      headers: {
        "Content-Type": "application/json"
      },
      method: "post",
      body: JSON.stringify(mapConfig)
    }).then(res => console.log(res));
  };

  updatePosition = (key, value) => {
    const newPosition = {
      lat: this.state.lat,
      lng: this.state.lng,
      [key]: value
    };

    this.map.setCenter(newPosition);
    this.setState(newPosition);
  };

  onSliderUpdate = value => {
    const startDate = new Date(this.state.startDate);
    const endDate = new Date(this.state.endDate);

    const diff = moment.duration(moment(endDate).diff(moment(startDate)));

    const sliderDate = moment(startDate)
      .add(Math.round(diff.asSeconds() * value), "s")
      .toDate();

    this.filterMap(sliderDate);
  };

  onIntervalChange = value => {
    this.setState({ interval: value });
  };

  onInputChange = ev => {
    const value = ev.target.type === "checkbox" ? ev.target.checked : ev.target.value;
    const name = ev.target.name;
    this.setState(set(this.state, name, value), () => {
      this.updateMap(this.state.style);
    });
  };

  render() {
    return (
      <div>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }} ref={el => (this.elMap = el)} />

        <div
          style={{
            position: "absolute",
            right: 50,
            top: 50,
            width: 300,
            padding: 20,
            background: "rgba(255, 255, 255, 0.9)"
          }}
        >
          <div>
            <span style={{ display: "inline-block", width: 40 }}>lat:</span>
            <FloatNumberPicker value={this.state.lat} onInput={e => this.updatePosition("lat", e)} />
          </div>

          <div>
            <span style={{ display: "inline-block", width: 40 }}>lng:</span>
            <FloatNumberPicker value={this.state.lng} onInput={e => this.updatePosition("lng", e)} />
          </div>

          <div>
            <DatePicker onInput={e => this.setState({ startDate: e })} value={this.state.startDate} />
            &mdash;
            <DatePicker onInput={e => this.setState({ endDate: e })} value={this.state.endDate} />
          </div>

          <div>
            <select value={this.state.interval} onChange={e => this.onIntervalChange(e.target.value)}>
              <option value="hours">Hour</option>
              <option value="days">Day</option>
              <option value="weeks">week</option>
            </select>
          </div>

          <div style={{ border: "1px solid white" }}>
            Styles
            <div style={{ paddingLeft: 10 }}>
              Buildings
              <input
                type="checkbox"
                name="style.buildings-outline.enabled"
                checked={this.state.style["buildings-outline"].enabled}
                onChange={this.onInputChange}
              />
              <label style={{ display: "block" }}>
                Color:
                <input
                  type="text"
                  name="style.buildings-outline.line-color"
                  value={this.state.style["buildings-outline"]["line-color"]}
                  onChange={this.onInputChange}
                />
              </label>
              <label style={{ display: "block" }}>
                Opacity:
                <input
                  type="number"
                  step="0.1"
                  max="1"
                  min="0"
                  name="style.buildings-outline.line-opacity"
                  value={this.state.style["buildings-outline"]["line-opacity"]}
                  onChange={this.onInputChange}
                />
              </label>
              Highlight
              <input
                type="checkbox"
                name="style.buildings-outline.highlight.enabled"
                checked={this.state.style["buildings-outline"].highlight.enabled}
                onChange={this.onInputChange}
              />
              <label style={{ display: "block" }}>
                Highlight Color:
                <input
                  type="text"
                  name="style.buildings-outline.highlight.line-color"
                  value={this.state.style["buildings-outline"].highlight["line-color"]}
                  onChange={this.onInputChange}
                />
              </label>
              <label style={{ display: "block" }}>
                Highlight Opacity:
                <input
                  type="number"
                  step="0.1"
                  max="1"
                  min="0"
                  name="style.buildings-outline.highlight.line-opacity"
                  value={this.state.style["buildings-outline"].highlight["line-opacity"]}
                  onChange={this.onInputChange}
                />
              </label>
              <hr />
            </div>
            <div style={{ paddingLeft: 10 }}>
              Roads
              <input
                type="checkbox"
                name="style.roads.enabled"
                checked={this.state.style["roads"].enabled}
                onChange={this.onInputChange}
              />
              <label style={{ display: "block" }}>
                Color:
                <input
                  type="text"
                  name="style.roads.line-color"
                  value={this.state.style["roads"]["line-color"]}
                  onChange={this.onInputChange}
                />
              </label>
              <label style={{ display: "block" }}>
                Opacity:
                <input
                  type="number"
                  step="0.1"
                  max="1"
                  min="0"
                  name="style.roads.line-opacity"
                  value={this.state.style["roads"]["line-opacity"]}
                  onChange={this.onInputChange}
                />
              </label>
              Highlight
              <input
                type="checkbox"
                name="style.roads.highlight.enabled"
                checked={this.state.style["roads"].highlight.enabled}
                onChange={this.onInputChange}
              />
              <label style={{ display: "block" }}>
                Highlight Color:
                <input
                  type="text"
                  name="style.roads.highlight.line-color"
                  value={this.state.style["roads"].highlight["line-color"]}
                  onChange={this.onInputChange}
                />
              </label>
              <label style={{ display: "block" }}>
                Highlight Opacity:
                <input
                  type="number"
                  step="0.1"
                  max="1"
                  min="0"
                  name="style.roads.highlight.line-opacity"
                  value={this.state.style["roads"].highlight["line-opacity"]}
                  onChange={this.onInputChange}
                />
              </label>
              <hr />
            </div>
          </div>

          <div>
            <input
              type="range"
              min={0}
              max={100}
              defaultValue={0}
              style={{ width: 280 }}
              disabled={this.state.startDate === null || this.state.endDate === null}
              onChange={e => this.onSliderUpdate(e.target.value / 100)}
            />
          </div>

          <div>
            Email:
            <input value={this.state.email} onChange={e => this.setState({ email: e.target.value })} />
          </div>

          <button disabled={Object.keys(this.state).some(key => this.state[key] === null)} onClick={this.onClickRender}>
            Render
          </button>
        </div>

        {IS_DEBUG && (
          <div
            style={{
              position: "absolute",
              top: 500,
              right: 50,
              width: 300,
              height: 600,
              padding: 20,
              overflow: "scroll",
              background: "rgba(255, 255, 255, 0.9)"
            }}
          >
            {JSON.stringify(this.state.features, null, 2)}
          </div>
        )}
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("app"));
