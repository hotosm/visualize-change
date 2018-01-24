const React = require("react");
const ReactDOM = require("react-dom");
const mapboxgl = require("mapbox-gl");
const moment = require("moment");

require("mapbox-gl/dist/mapbox-gl.css");

const setupMap = require("./map");

// TODO: move to docker env: https://docs.docker.com/compose/environment-variables/ (passing environment variables through to containers"
mapboxgl.accessToken =
  "pk.eyJ1Ijoic3p5bW9uayIsImEiOiJjamNmenY2d2oxOHJsMzNyd2dkdXAweWpsIn0.EnpGgGzuSUfAtE7WLkXdyQ";

const DatePicker = ({ onInput }) => (
  <input type="date" onInput={e => onInput(e.target.value)} />
);

const FloatNumberPicker = ({ onInput, value = 0.0 }) => (
  <input
    type="number"
    step="any"
    value={value}
    onChange={e => onInput(e.target.value)}
  />
);

class App extends React.Component {
  constructor() {
    super();

    this.state = {
      lat: -8.343,
      lng: 115.507,
      startDate: null,
      endDate: null,
      email: ""
    };
  }

  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: this.elMap,
      style: "mapbox://styles/mapbox/basic-v9",
      center: [this.state.lng, this.state.lat],
      zoom: 12
    });

    // add layers
    const { filter: filterMap } = setupMap(this.map);
    this.filterMap = filterMap;

    this.map.on("move", () => {
      // FIXME: setting position from updatePosition triggers this as well, not a problem for now though..?
      this.setState({
        lat: this.map.getCenter().lat,
        lng: this.map.getCenter().lng
      });
    });
  }

  componententWillUmoun() {
    this.map.remove();
  }

  onClickRender = () => {
    console.log("render", this.state);

    fetch("/api/queue-render", {
      headers: {
        "Content-Type": "application/json"
      },
      method: "post",
      body: JSON.stringify(this.state)
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

  render() {
    return (
      <div>
        <div
          style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
          ref={el => (this.elMap = el)}
        />

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
            <FloatNumberPicker
              value={this.state.lat}
              onInput={e => this.updatePosition("lat", e)}
            />
          </div>

          <div>
            <span style={{ display: "inline-block", width: 40 }}>lng:</span>
            <FloatNumberPicker
              value={this.state.lng}
              onInput={e => this.updatePosition("lng", e)}
            />
          </div>

          <div>
            <DatePicker onInput={e => this.setState({ startDate: e })} />
            &mdash;
            <DatePicker onInput={e => this.setState({ endDate: e })} />
          </div>

          <div>
            <input
              type="range"
              min={0}
              max={100}
              defaultValue={0}
              style={{ width: 280 }}
              disabled={
                this.state.startDate === null || this.state.endDate === null
              }
              onChange={e => this.onSliderUpdate(e.target.value / 100)}
            />
          </div>

          <div>
            Email:
            <input onChange={e => this.setState({ email: e.target.value })} />
          </div>

          <button
            disabled={Object.keys(this.state).some(
              key => this.state[key] === null
            )}
            onClick={this.onClickRender}
          >
            Render
          </button>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("app"));
