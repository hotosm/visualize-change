const ReactDOM = require("react-dom");
const React = require("react");

const DatePicker = ({ onInput }) => (
  <input type="date" onInput={e => onInput(e.target.value)} />
);

const FloatNumberPicker = ({ onInput, value = 0.0 }) => (
  <input
    type="number"
    step="0.001"
    value={value}
    onChange={e => onInput(e.target.value)}
  />
);

class App extends React.Component {
  constructor() {
    super();

    this.state = {
      lat: -8.343,
      lon: 115.507,
      startDate: null,
      endDate: null
    };
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

  render() {
    return (
      <div>
        <div>
          <span style={{ display: "inline-block", width: 40 }}>lat:</span>
          <FloatNumberPicker
            value={this.state.lat}
            onInput={e => this.setState({ lat: e })}
          />
        </div>

        <div>
          <span style={{ display: "inline-block", width: 40 }}>lon:</span>
          <FloatNumberPicker
            value={this.state.lon}
            onInput={e => this.setState({ lon: e })}
          />
        </div>

        <div>
          <DatePicker onInput={e => this.setState({ startDate: e })} />
          &mdash;
          <DatePicker onInput={e => this.setState({ endDate: e })} />
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
    );
  }
}

ReactDOM.render(<App />, document.getElementById("app"));
